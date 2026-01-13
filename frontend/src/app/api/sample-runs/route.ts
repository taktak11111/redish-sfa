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

type SampleRun = {
  id: string
  runKey: string
  label: string | null
  createdBy: string | null
  createdAt: string
}

function toCamel(record: any): SampleRun {
  return {
    id: String(record.id),
    runKey: String(record.run_key),
    label: record.label ?? null,
    createdBy: record.created_by ?? null,
    createdAt: String(record.created_at),
  }
}

export async function GET() {
  const authResult = await requireAuth()
  if (isAuthError(authResult)) return authResult

  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('sample_runs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ error: '取得に失敗しました', details: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: (data || []).map(toCamel) })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: '取得に失敗しました', details: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth()
  if (isAuthError(authResult)) return authResult

  try {
    const body = (await request.json()) as unknown
    const runKey = typeof (body as any)?.runKey === 'string' ? (body as any).runKey : null
    const label = typeof (body as any)?.label === 'string' ? (body as any).label : null
    const createdBy = typeof (body as any)?.createdBy === 'string' ? (body as any).createdBy : null

    if (!runKey || !runKey.trim()) {
      return NextResponse.json({ error: 'runKeyは必須です' }, { status: 400 })
    }

    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('sample_runs')
      .insert({ run_key: runKey.trim(), label, created_by: createdBy })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: '作成に失敗しました', details: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: toCamel(data) })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: '作成に失敗しました', details: message }, { status: 500 })
  }
}

