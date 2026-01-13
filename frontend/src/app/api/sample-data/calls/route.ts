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

function makeRunKey() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const rand = Math.random().toString(36).slice(2, 7)
  return `${y}${m}${day}_${hh}${mm}_${rand}`
}

function pad4(n: number) {
  return String(n).padStart(4, '0')
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth()
  if (isAuthError(authResult)) return authResult

  try {
    const body = (await request.json()) as unknown
    const countRaw = (body as any)?.count
    const count = Number.isFinite(Number(countRaw)) ? Math.max(1, Math.min(200, Number(countRaw))) : 15
    const staffIS = typeof (body as any)?.staffIS === 'string' ? String((body as any).staffIS) : null
    const leadSource = typeof (body as any)?.leadSource === 'string' ? String((body as any).leadSource) : 'TEMPOS'
    const runKey = typeof (body as any)?.runKey === 'string' ? String((body as any).runKey).trim() : makeRunKey()
    const label = typeof (body as any)?.label === 'string' ? String((body as any).label) : 'calls sample'

    const supabase = getSupabaseClient()

    // 1) sample_runs upsert
    const { data: runRow, error: runErr } = await supabase
      .from('sample_runs')
      .upsert({ run_key: runKey, label }, { onConflict: 'run_key', ignoreDuplicates: false })
      .select('id, run_key')
      .single()

    if (runErr || !runRow?.id) {
      return NextResponse.json(
        { error: 'sample_runsの作成に失敗しました', details: runErr?.message || 'unknown' },
        { status: 500 }
      )
    }

    const runId = String(runRow.id)

    // 2) call_records insert (ignore duplicates)
    const today = new Date().toISOString().slice(0, 10)
    const rows = Array.from({ length: count }).map((_, idx) => {
      const n = idx + 1
      const leadId = `SAMPLE-${runKey}-${pad4(n)}`
      const phone = `090-${String(1000 + n).padStart(4, '0')}-${String(2000 + n).padStart(4, '0')}`
      return {
        lead_id: leadId,
        lead_source: leadSource,
        linked_date: today,
        industry: 'サンプル',
        company_name: `サンプル会社 ${n}`,
        contact_name: `サンプル担当 ${n}`,
        contact_name_kana: `さんぷる ${n}`,
        phone,
        email: `sample${n}@example.com`,
        address: '東京都',
        status: '未架電',
        staff_is: staffIS,
        today_call_status: null,
        call_status_today: null,
      }
    })

    const { data: inserted, error: insertErr } = await supabase
      .from('call_records')
      .upsert(rows, { onConflict: 'lead_id', ignoreDuplicates: true })
      .select('lead_id')

    if (insertErr) {
      return NextResponse.json({ error: 'call_recordsの投入に失敗しました', details: insertErr.message }, { status: 500 })
    }

    const leadIds: string[] = (inserted || []).map((r: any) => String(r.lead_id))

    // 3) registry (ignore duplicates)
    if (leadIds.length > 0) {
      const entityRows = leadIds.map((id) => ({
        run_id: runId,
        table_name: 'call_records',
        entity_key: id,
      }))
      const { error: regErr } = await supabase
        .from('sample_run_entities')
        .upsert(entityRows, { onConflict: 'run_id,table_name,entity_key', ignoreDuplicates: true })

      if (regErr) {
        // registryは安全機能だが、投入自体は完了しているので致命にしない
        console.error('[api/sample-data/calls] registry upsert failed:', regErr)
      }
    }

    return NextResponse.json({
      data: { runKey, runId, insertedCount: leadIds.length, requestedCount: count, leadIds },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: '投入に失敗しました', details: message }, { status: 500 })
  }
}

