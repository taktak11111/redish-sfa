import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { requireAuth, isAuthError } from '@/lib/auth/guard'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

let supabaseClient: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
    })
  }
  return supabaseClient
}

async function resolveRunIdByRunKey(supabase: SupabaseClient, runKey: string) {
  const { data, error } = await supabase
    .from('sample_runs')
    .select('id, run_key')
    .eq('run_key', runKey)
    .single()
  if (error) return { data: null as null | { id: string; run_key: string }, error }
  return { data: { id: String((data as any).id), run_key: String((data as any).run_key) }, error: null }
}

export async function GET(request: NextRequest) {
  const authResult = await requireAuth()
  if (isAuthError(authResult)) return authResult

  const runKey = request.nextUrl.searchParams.get('runKey')
  if (!runKey) return NextResponse.json({ error: 'runKeyは必須です' }, { status: 400 })

  try {
    const supabase = getSupabaseClient()
    const resolved = await resolveRunIdByRunKey(supabase, runKey)
    if (resolved.error || !resolved.data) {
      return NextResponse.json({ error: 'runKeyが見つかりません', details: resolved.error?.message }, { status: 404 })
    }

    const runId = resolved.data.id
    const { data, error } = await supabase
      .from('sample_run_entities')
      .select('table_name, entity_key')
      .eq('run_id', runId)

    if (error) {
      return NextResponse.json({ error: '確認に失敗しました', details: error.message }, { status: 500 })
    }

    const byTable: Record<string, number> = {}
    for (const row of data || []) {
      const t = String((row as any).table_name)
      byTable[t] = (byTable[t] || 0) + 1
    }

    return NextResponse.json({ data: { runKey, runId, counts: byTable } })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: '確認に失敗しました', details: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth()
  if (isAuthError(authResult)) return authResult

  try {
    const body = (await request.json()) as unknown
    const runKey = typeof (body as any)?.runKey === 'string' ? String((body as any).runKey).trim() : null
    if (!runKey) return NextResponse.json({ error: 'runKeyは必須です' }, { status: 400 })

    const supabase = getSupabaseClient()
    const resolved = await resolveRunIdByRunKey(supabase, runKey)
    if (resolved.error || !resolved.data) {
      return NextResponse.json({ error: 'runKeyが見つかりません', details: resolved.error?.message }, { status: 404 })
    }

    const runId = resolved.data.id

    // delete call_records by registry (small batches)
    const { data: entities, error: listErr } = await supabase
      .from('sample_run_entities')
      .select('table_name, entity_key')
      .eq('run_id', runId)
      .eq('table_name', 'call_records')

    if (listErr) {
      return NextResponse.json({ error: '削除対象の取得に失敗しました', details: listErr.message }, { status: 500 })
    }

    const leadIds = (entities || []).map((r: any) => String(r.entity_key))

    if (leadIds.length > 0) {
      const { error: delCallsErr } = await supabase
        .from('call_records')
        .delete()
        .in('lead_id', leadIds)
      if (delCallsErr) {
        return NextResponse.json({ error: 'call_recordsの削除に失敗しました', details: delCallsErr.message }, { status: 500 })
      }
    }

    // finally delete run (cascade removes entities)
    const { error: delRunErr } = await supabase.from('sample_runs').delete().eq('id', runId)
    if (delRunErr) {
      return NextResponse.json({ error: 'runの削除に失敗しました', details: delRunErr.message }, { status: 500 })
    }

    return NextResponse.json({
      data: { runKey, runId, deleted: { call_records: leadIds.length, sample_runs: 1 } },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: '削除に失敗しました', details: message }, { status: 500 })
  }
}

