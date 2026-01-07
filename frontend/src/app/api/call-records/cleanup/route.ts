import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

// DELETE: 指定したソース以外のデータを削除
export async function DELETE(request: NextRequest) {
  console.log('[cleanup] DELETE request received')
  
  try {
    // 環境変数チェック
    if (!SUPABASE_URL) {
      console.error('[cleanup] SUPABASE_URL is missing')
      return NextResponse.json({ error: 'SUPABASE_URL is missing' }, { status: 500 })
    }
    if (!SUPABASE_SERVICE_KEY) {
      console.error('[cleanup] SUPABASE_SERVICE_KEY is missing')
      return NextResponse.json({ error: 'SUPABASE_SERVICE_KEY is missing' }, { status: 500 })
    }
    
    const { searchParams } = new URL(request.url)
    const keepSources = searchParams.get('keep')?.split(',') || ['TEMPOS', 'OMC']
    console.log('[cleanup] Keep sources:', keepSources)
    
    const supabase = getSupabaseClient()
    
    // まず全レコードを取得して、削除対象を特定
    const { data: allRecords, error: selectError } = await supabase
      .from('call_records')
      .select('lead_id, lead_source')
    
    if (selectError) {
      console.error('[cleanup] Select error:', selectError)
      return NextResponse.json({ error: selectError.message }, { status: 500 })
    }
    
    // 削除対象を特定（keepSourcesに含まれないもの）
    const toDelete = allRecords?.filter(r => !keepSources.includes(r.lead_source)) || []
    
    console.log(`[cleanup] Found ${toDelete.length} records to delete out of ${allRecords?.length || 0} total`)
    console.log(`[cleanup] Keep sources: ${keepSources.join(', ')}`)
    console.log(`[cleanup] Delete sources: ${Array.from(new Set(toDelete.map(r => r.lead_source))).join(', ')}`)
    
    if (toDelete.length === 0) {
      return NextResponse.json({ deleted: 0, message: '削除対象のレコードがありません' })
    }
    
    // IDで削除実行
    const idsToDelete = toDelete.map(r => r.lead_id)
    
    // 1. まず関連するdealsを削除
    const { error: dealsDeleteError } = await supabase
      .from('deals')
      .delete()
      .in('lead_id', idsToDelete)
    
    if (dealsDeleteError) {
      console.error('[cleanup] Deals delete error:', dealsDeleteError)
      return NextResponse.json({ error: `deals削除エラー: ${dealsDeleteError.message}` }, { status: 500 })
    }
    
    // 2. 関連するcall_historyを削除
    const { error: historyDeleteError } = await supabase
      .from('call_history')
      .delete()
      .in('lead_id', idsToDelete)
    
    if (historyDeleteError) {
      console.error('[cleanup] Call history delete error:', historyDeleteError)
      // call_historyが存在しない場合はエラーを無視
    }
    
    // 3. call_recordsを削除
    const { error: deleteError } = await supabase
      .from('call_records')
      .delete()
      .in('lead_id', idsToDelete)
    
    if (deleteError) {
      console.error('[cleanup] Delete error:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }
    
    return NextResponse.json({ 
      deleted: toDelete.length,
      message: `${toDelete.length}件のダミーデータを削除しました`,
      sources: Array.from(new Set(toDelete.map(r => r.lead_source)))
    })
  } catch (error: any) {
    console.error('[cleanup] Error:', error)
    return NextResponse.json(
      { error: error.message || 'クリーンアップに失敗しました' },
      { status: 500 }
    )
  }
}
