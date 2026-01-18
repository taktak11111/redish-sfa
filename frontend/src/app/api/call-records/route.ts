import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Supabase設定（サービスロールキーを使用してRLSをバイパス）
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabaseClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error('Supabase environment variables missing')
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  })
}

// GET: 連携データ一覧を取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const leadSource = searchParams.get('lead_source')
    const limit = parseInt(searchParams.get('limit') || '100', 10)
    
    const supabase = getSupabaseClient()
    
    // 総件数を取得
    let countQuery = supabase
      .from('call_records')
      .select('*', { count: 'exact', head: true })
    
    if (leadSource && leadSource !== 'all') {
      countQuery = countQuery.eq('lead_source', leadSource)
    }
    
    const { count: totalCount } = await countQuery
    
    // データを取得
    let query = supabase
      .from('call_records')
      .select('*')
      .order('linked_date', { ascending: false })
    
    // limit=0の場合は制限なし、それ以外はlimitを適用
    if (limit > 0) {
      query = query.limit(limit)
    }
    
    if (leadSource && leadSource !== 'all') {
      query = query.eq('lead_source', leadSource)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('[API/call-records] GET error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ records: data || [], totalCount })
  } catch (error: any) {
    console.error('[API/call-records] GET error:', error)
    return NextResponse.json(
      { error: error.message || 'データの取得に失敗しました' },
      { status: 500 }
    )
  }
}
