import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Supabase設定
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// GET: 定期実行用（Vercel Cron Jobsから呼び出される）
export async function GET(request: NextRequest) {
  try {
    // 認証チェック（Vercel Cron Jobsからのリクエストか確認）
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // 平日9時〜18時のチェック（UTC時間で計算）
    const now = new Date()
    const hour = now.getUTCHours() + 9 // JSTに変換
    const dayOfWeek = now.getUTCDay() // 0=日曜日, 1=月曜日, ..., 6=土曜日
    
    // 平日（月〜金）かつ9時〜18時の範囲内かチェック
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5
    const isBusinessHours = hour >= 9 && hour < 18
    
    if (!isWeekday || !isBusinessHours) {
      return NextResponse.json({
        success: false,
        message: '定期実行は平日9時〜18時の間のみ実行されます',
        currentTime: now.toISOString(),
        hour,
        dayOfWeek,
      })
    }
    
    // データベースから連携済み設定を取得
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
    })
    
    const { data: configs, error: fetchError } = await supabase
      .from('spreadsheet_configs')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (fetchError) {
      console.error('[API/spreadsheet/sync-scheduled] Failed to fetch configs:', fetchError)
      return NextResponse.json({
        success: false,
        error: '設定の取得に失敗しました',
        details: fetchError.message,
      }, { status: 500 })
    }
    
    if (!configs || configs.length === 0) {
      return NextResponse.json({
        success: true,
        message: '同期する設定がありません',
        currentTime: now.toISOString(),
      })
    }
    
    // 設定を同期APIの形式に変換
    const configsForSync = configs.map((row: any) => ({
      id: row.id,
      name: row.name,
      spreadsheetId: row.spreadsheet_id,
      sheetName: row.sheet_name,
      sheetGid: row.sheet_gid,
      headerRow: row.header_row,
      columnMappings: row.column_mappings || [],
      leadSourcePrefix: row.lead_source_prefix,
    }))
    
    // 同期APIを呼び出す
    const syncResponse = await fetch(`${request.nextUrl.origin}/api/spreadsheet/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ configs: configsForSync }),
    })
    
    const syncResult = await syncResponse.json()
    
    // 最終インポート日時を更新
    if (syncResult.success) {
      const lastImportedAt = new Date().toISOString()
      await supabase
        .from('spreadsheet_configs')
        .update({ last_imported_at: lastImportedAt })
        .in('id', configs.map((c: any) => c.id))
    }
    
    return NextResponse.json({
      success: syncResult.success,
      message: '定期実行が完了しました',
      totalImported: syncResult.totalImported || 0,
      totalFailed: syncResult.totalFailed || 0,
      results: syncResult.results || [],
      currentTime: now.toISOString(),
    })
    
  } catch (error: any) {
    console.error('[API/spreadsheet/sync-scheduled] Error:', error)
    return NextResponse.json(
      { error: error.message || '定期実行に失敗しました' },
      { status: 500 }
    )
  }
}
