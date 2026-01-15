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
  return msg.includes('does not exist') && msg.includes('data_quality_issues')
}

// GET: data_quality_issues一覧
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) return authResult

    const searchParams = request.nextUrl.searchParams
    const status = (searchParams.get('status') || 'open').toLowerCase()
    const limit = Math.min(200, Math.max(1, Number(searchParams.get('limit') || '50')))
    const settingKey = searchParams.get('settingKey')
    const sourceRefId = searchParams.get('sourceRefId')

    const supabase = await createClient()
    const service = getServiceSupabaseIfAvailable()
    const client = process.env.NODE_ENV === 'development' && service ? service : supabase

    let q = client
      .from('data_quality_issues')
      .select('*')
      .order('last_seen_at', { ascending: false })
      .limit(limit)

    if (status === 'open' || status === 'resolved' || status === 'ignored') {
      q = q.eq('status', status)
    }
    if (settingKey) {
      q = q.eq('setting_key', settingKey)
    }
    if (sourceRefId) {
      q = q.eq('source_ref_id', sourceRefId)
    }

    const { data, error } = await q

    if (error) {
      if (isMissingTableError(error)) {
        return NextResponse.json({ issues: [], tableMissing: true })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ issues: data || [], tableMissing: false })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || '要確認一覧の取得に失敗しました' }, { status: 500 })
  }
}

