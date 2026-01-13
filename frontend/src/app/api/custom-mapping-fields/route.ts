import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/guard'

// カスタムマッピングフィールドの型
interface CustomMappingField {
  id?: string
  field_key: string
  field_label: string
  field_type: 'text' | 'number' | 'date' | 'boolean'
  description?: string
  is_active?: boolean
  created_by?: string
}

// ユーザー権限チェック（admin/managerのみ）
async function checkPermission(supabase: any, requiredRole: 'admin' | 'manager' | 'admin_only' = 'manager') {
  const authResult = await requireAuth()
  if (authResult instanceof NextResponse) {
    return authResult // 認証エラー
  }

  // 開発モードでは権限チェックをスキップ
  if (process.env.NODE_ENV === 'development') {
    return null
  }

  // セッションからユーザー情報を取得
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json(
      { error: '認証が必要です' },
      { status: 401 }
    )
  }

  // ユーザー情報を取得
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userError || !userData) {
    // ユーザーがusersテーブルに存在しない場合は権限エラー
    return NextResponse.json(
      { error: 'ユーザー情報が見つかりません' },
      { status: 403 }
    )
  }

  const userRole = userData.role as 'admin' | 'manager' | 'staff'
  
  // 権限チェック
  if (requiredRole === 'admin_only' && userRole !== 'admin') {
    return NextResponse.json(
      { error: '管理者権限が必要です' },
      { status: 403 }
    )
  }

  if (requiredRole === 'manager' && !['admin', 'manager'].includes(userRole)) {
    return NextResponse.json(
      { error: '管理者またはマネージャー権限が必要です' },
      { status: 403 }
    )
  }

  return null
}

// GET: カスタムフィールド一覧取得
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { data, error } = await supabase
      .from('custom_mapping_fields')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[API/custom-mapping-fields] Error:', error)
      return NextResponse.json(
        { error: 'カスタムフィールドの取得に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({ fields: data || [] })
  } catch (error: any) {
    console.error('[API/custom-mapping-fields] Error:', error)
    return NextResponse.json(
      { error: error.message || 'カスタムフィールドの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST: カスタムフィールド作成
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // 権限チェック（adminのみ）
    const permissionError = await checkPermission(supabase, 'admin_only')
    if (permissionError) {
      return permissionError
    }

    const body: CustomMappingField = await request.json()
    const { field_key, field_label, field_type, description } = body

    if (!field_key || !field_label || !field_type) {
      return NextResponse.json(
        { error: 'フィールドキー、表示名、タイプは必須です' },
        { status: 400 }
      )
    }

    // フィールドキーの重複チェック
    const { data: existing } = await supabase
      .from('custom_mapping_fields')
      .select('id')
      .eq('field_key', field_key)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'このフィールドキーは既に使用されています' },
        { status: 400 }
      )
    }

    // ユーザーIDを取得
    const { data: { user } } = await supabase.auth.getUser()
    const created_by = user?.id || null

    const { data, error } = await supabase
      .from('custom_mapping_fields')
      .insert({
        field_key,
        field_label,
        field_type,
        description,
        is_active: true,
        created_by,
      })
      .select()
      .single()

    if (error) {
      console.error('[API/custom-mapping-fields] Error:', error)
      return NextResponse.json(
        { error: 'カスタムフィールドの作成に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({ field: data })
  } catch (error: any) {
    console.error('[API/custom-mapping-fields] Error:', error)
    return NextResponse.json(
      { error: error.message || 'カスタムフィールドの作成に失敗しました' },
      { status: 500 }
    )
  }
}

// PUT: カスタムフィールド更新
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // 権限チェック（adminのみ）
    const permissionError = await checkPermission(supabase, 'admin_only')
    if (permissionError) {
      return permissionError
    }

    const body: CustomMappingField & { id: string } = await request.json()
    const { id, field_label, field_type, description, is_active } = body

    if (!id) {
      return NextResponse.json(
        { error: 'IDは必須です' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (field_label !== undefined) updateData.field_label = field_label
    if (field_type !== undefined) updateData.field_type = field_type
    if (description !== undefined) updateData.description = description
    if (is_active !== undefined) updateData.is_active = is_active

    const { data, error } = await supabase
      .from('custom_mapping_fields')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[API/custom-mapping-fields] Error:', error)
      return NextResponse.json(
        { error: 'カスタムフィールドの更新に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({ field: data })
  } catch (error: any) {
    console.error('[API/custom-mapping-fields] Error:', error)
    return NextResponse.json(
      { error: error.message || 'カスタムフィールドの更新に失敗しました' },
      { status: 500 }
    )
  }
}

// DELETE: カスタムフィールド削除
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // 権限チェック（adminのみ）
    const permissionError = await checkPermission(supabase, 'admin_only')
    if (permissionError) {
      return permissionError
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'IDは必須です' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('custom_mapping_fields')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[API/custom-mapping-fields] Error:', error)
      return NextResponse.json(
        { error: 'カスタムフィールドの削除に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[API/custom-mapping-fields] Error:', error)
    return NextResponse.json(
      { error: error.message || 'カスタムフィールドの削除に失敗しました' },
      { status: 500 }
    )
  }
}
