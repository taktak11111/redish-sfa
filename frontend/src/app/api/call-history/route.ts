import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { requireAuth, isAuthError } from '@/lib/auth/guard'

// Supabase設定
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
// サーバーサイドでは SERVICE_ROLE_KEY を優先使用、なければ ANON_KEY を使用
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Supabaseクライアント（遅延初期化）
let supabaseClient: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error(`Supabase environment variables missing. URL: ${!!SUPABASE_URL}, KEY: ${!!SUPABASE_KEY}`)
    }
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: false,
      },
    })
  }
  return supabaseClient
}

// スネークケース → キャメルケース変換
function toCamelCase(record: any) {
  return {
    id: record.id,
    callRecordId: record.call_record_id,
    callDate: record.call_date,
    callTime: record.call_time,
    staffIS: record.staff_is,
    status: record.status,
    result: record.result,
    duration: record.duration,
    memo: record.memo,
    createdAt: record.created_at,
  }
}

// GET: 架電履歴を取得
export async function GET(request: NextRequest) {
  // 認証チェック
  const authResult = await requireAuth()
  if (isAuthError(authResult)) {
    return authResult
  }

  try {
    const supabase = getSupabaseClient()
    const searchParams = request.nextUrl.searchParams
    const callRecordId = searchParams.get('callRecordId')
    const leadId = searchParams.get('leadId')

    let query = supabase
      .from('call_history')
      .select('*')
      .order('call_date', { ascending: false })

    if (callRecordId) {
      query = query.eq('call_record_id', callRecordId)
    }

    // leadIdが指定された場合、まずcall_recordsから該当するidを取得
    if (leadId) {
      const { data: callRecord } = await supabase
        .from('call_records')
        .select('id')
        .eq('lead_id', leadId)
        .single()

      if (callRecord) {
        query = query.eq('call_record_id', callRecord.id)
      } else {
        return NextResponse.json({ data: [] })
      }
    }

    const { data, error } = await query

    if (error) {
      console.error('[API/call-history] Supabase error:', error)
      return NextResponse.json(
        { error: 'データの取得に失敗しました', details: error.message },
        { status: 500 }
      )
    }

    const history = (data || []).map(toCamelCase)
    return NextResponse.json({ data: history })
  } catch (error) {
    console.error('[API/call-history] Error:', error)
    return NextResponse.json(
      { error: 'データの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST: 架電履歴を追加
export async function POST(request: NextRequest) {
  // 認証チェック
  const authResult = await requireAuth()
  if (isAuthError(authResult)) {
    return authResult
  }

  try {
    const supabase = getSupabaseClient()
    const body = await request.json()
    const { leadId, callDate, callTime, staffIS, status, result, duration, memo } = body

    // leadIdからcall_record_idを取得
    const { data: callRecord } = await supabase
      .from('call_records')
      .select('id')
      .eq('lead_id', leadId)
      .single()

    if (!callRecord) {
      return NextResponse.json(
        { error: '架電記録が見つかりません' },
        { status: 404 }
      )
    }

    const { data, error } = await supabase
      .from('call_history')
      .insert({
        call_record_id: callRecord.id,
        call_date: callDate,
        call_time: callTime,
        staff_is: staffIS,
        status: status,
        result: result,
        duration: duration,
        memo: memo,
      })
      .select()
      .single()

    if (error) {
      console.error('[API/call-history] Supabase error:', error)
      return NextResponse.json(
        { error: '架電履歴の追加に失敗しました', details: error.message },
        { status: 500 }
      )
    }

    // 架電記録のcall_countを更新
    const { count } = await supabase
      .from('call_history')
      .select('*', { count: 'exact', head: true })
      .eq('call_record_id', callRecord.id)

    await supabase
      .from('call_records')
      .update({
        call_count: count || 0,
        last_called_date: callDate,
      })
      .eq('id', callRecord.id)

    return NextResponse.json({ data: toCamelCase(data) })
  } catch (error) {
    console.error('[API/call-history] Error:', error)
    return NextResponse.json(
      { error: '架電履歴の追加に失敗しました' },
      { status: 500 }
    )
  }
}

// DELETE: 架電履歴を削除
export async function DELETE(request: NextRequest) {
  // 認証チェック
  const authResult = await requireAuth()
  if (isAuthError(authResult)) {
    return authResult
  }

  try {
    const supabase = getSupabaseClient()
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: '履歴IDが必要です' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('call_history')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[API/call-history] Supabase error:', error)
      return NextResponse.json(
        { error: '架電履歴の削除に失敗しました', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API/call-history] Error:', error)
    return NextResponse.json(
      { error: '架電履歴の削除に失敗しました' },
      { status: 500 }
    )
  }
}







