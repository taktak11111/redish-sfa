import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/guard'

function getServiceSupabaseIfAvailable() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createSupabaseClient(url, key, { auth: { persistSession: false } })
}

function isMissingTableError(err: any): boolean {
  const msg = String(err?.message ?? '')
  return msg.includes('does not exist') && msg.includes('import_runs')
}

// GET: import_runs一覧（直近N件）
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) return authResult

    const searchParams = request.nextUrl.searchParams
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') || '20')))

    const supabase = await createClient()
    const service = getServiceSupabaseIfAvailable()
    const client = process.env.NODE_ENV === 'development' && service ? service : supabase

    const { data, error } = await client
      .from('import_runs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(limit)

    if (error) {
      if (isMissingTableError(error)) {
        return NextResponse.json({ runs: [], tableMissing: true })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ runs: data || [], tableMissing: false })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'import_runsの取得に失敗しました' }, { status: 500 })
  }
}

