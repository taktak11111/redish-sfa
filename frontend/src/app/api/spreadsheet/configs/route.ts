import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'

// 開発モード: 認証をスキップ（本番では false に設定）
const DEV_SKIP_AUTH = process.env.NODE_ENV === 'development'

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

// GET: 設定一覧を取得
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    
    const { data, error } = await supabase
      .from('spreadsheet_configs')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('[API/spreadsheet/configs] GET error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ configs: data || [] })
  } catch (error: any) {
    console.error('[API/spreadsheet/configs] GET error:', error)
    return NextResponse.json(
      { error: error.message || '設定の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST: 設定を保存（新規作成または更新）
export async function POST(request: NextRequest) {
  try {
    let userEmail: string | null = null
    
    // 開発モードでは認証をスキップ
    if (!DEV_SKIP_AUTH) {
      // NextAuthセッションを確認（書き込み時のみ認証を要求）
      const session = await getServerSession(authOptions)
      if (!session?.user?.email) {
        return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
      }
      userEmail = session.user.email
    }
    
    const body = await request.json()
    const { configs } = body as { configs: any[] }
    
    if (!configs || !Array.isArray(configs)) {
      return NextResponse.json({ error: '設定データが必要です' }, { status: 400 })
    }
    
    const supabase = getSupabaseClient()
    
    // usersテーブルから現在のユーザーIDを取得（開発モードではスキップ）
    let userId: string | null = null
    if (userEmail) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', userEmail)
        .single()
      userId = userData?.id || null
    }
    
    const results: { success: boolean; id: string; error?: string }[] = []
    
    for (const config of configs) {
      try {
        // UUID形式チェック
        const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(config.id)
        
        const dataToSave: any = {
          name: config.name,
          lead_source_prefix: config.leadSourcePrefix,
          spreadsheet_id: config.spreadsheetId,
          sheet_name: config.sheetName,
          sheet_gid: config.sheetGid || null,
          header_row: config.headerRow,
          column_mappings: config.columnMappings || [],
          last_imported_at: config.lastImportedAt || null,
          updated_at: new Date().toISOString(),
          created_by: userId,
        }
        
        let result
        
        if (isValidUUID) {
          // UUIDが有効な場合: 既存レコードを確認
          const { data: existing } = await supabase
            .from('spreadsheet_configs')
            .select('id')
            .eq('id', config.id)
            .single()
          
          if (existing) {
            // 既存レコードを更新
            result = await supabase
              .from('spreadsheet_configs')
              .update(dataToSave)
              .eq('id', config.id)
              .select()
              .single()
          } else {
            // 新規挿入
            dataToSave.id = config.id
            result = await supabase
              .from('spreadsheet_configs')
              .insert(dataToSave)
              .select()
              .single()
          }
        } else {
          // UUIDが無効な場合: spreadsheet_id + sheet_nameで既存レコードを確認
          const { data: existing } = await supabase
            .from('spreadsheet_configs')
            .select('id')
            .eq('spreadsheet_id', config.spreadsheetId)
            .eq('sheet_name', config.sheetName)
            .single()
          
          if (existing) {
            // 既存レコードを更新
            result = await supabase
              .from('spreadsheet_configs')
              .update(dataToSave)
              .eq('id', existing.id)
              .select()
              .single()
          } else {
            // 新規挿入（IDなしで挿入し、DBが自動生成）
            result = await supabase
              .from('spreadsheet_configs')
              .insert(dataToSave)
              .select()
              .single()
          }
        }
        
        if (result.error) {
          console.error(`[API/spreadsheet/configs] Save error for ${config.id}:`, result.error)
          results.push({ success: false, id: config.id, error: result.error.message })
        } else {
          results.push({ success: true, id: result.data?.id || config.id })
        }
      } catch (configError: any) {
        console.error(`[API/spreadsheet/configs] Exception for ${config.id}:`, configError)
        results.push({ success: false, id: config.id, error: configError.message })
      }
    }
    
    return NextResponse.json({ results })
  } catch (error: any) {
    console.error('[API/spreadsheet/configs] POST error:', error)
    return NextResponse.json(
      { error: error.message || '設定の保存に失敗しました' },
      { status: 500 }
    )
  }
}

// DELETE: 設定を削除
export async function DELETE(request: NextRequest) {
  try {
    // 開発モードでは認証をスキップ
    if (!DEV_SKIP_AUTH) {
      // NextAuthセッションを確認
      const session = await getServerSession(authOptions)
      if (!session?.user?.email) {
        return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
      }
    }
    
    const body = await request.json()
    const { id } = body as { id: string }
    
    if (!id) {
      return NextResponse.json({ error: '設定IDが必要です' }, { status: 400 })
    }
    
    const supabase = getSupabaseClient()
    
    const { error } = await supabase
      .from('spreadsheet_configs')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('[API/spreadsheet/configs] DELETE error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[API/spreadsheet/configs] DELETE error:', error)
    return NextResponse.json(
      { error: error.message || '設定の削除に失敗しました' },
      { status: 500 }
    )
  }
}
