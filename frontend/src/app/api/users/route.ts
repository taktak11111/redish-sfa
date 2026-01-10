import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/guard'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// ユーザー権限チェック（adminのみ）
async function checkAdminPermission(supabase: any) {
  const authResult = await requireAuth()
  if (authResult instanceof NextResponse) {
    return authResult
  }

  // 開発モードでは権限チェックをスキップ
  if (process.env.NODE_ENV === 'development') {
    return null
  }

  // supabaseがnullの場合は、createClientを使用
  const client = supabase || await createClient()
  const { data: { user }, error: authError } = await client.auth.getUser()
  if (authError || !user) {
    return NextResponse.json(
      { error: '認証が必要です' },
      { status: 401 }
    )
  }

  const { data: userData, error: userError } = await client
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userError || !userData || userData.role !== 'admin') {
    return NextResponse.json(
      { error: '管理者権限が必要です' },
      { status: 403 }
    )
  }

  return null
}

// GET: ユーザー一覧取得
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    // 開発環境では、サービスロールキーを使用してRLSをバイパス
    if (process.env.NODE_ENV === 'development') {
      // サービスロールキーが利用可能な場合は使用（RLSをバイパス）
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      let client = supabase
      
      if (serviceRoleKey) {
        // サービスロールキーを使用してクライアントを作成
        client = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          serviceRoleKey,
          { auth: { persistSession: false } }
        ) as any
      }
      
      const { data, error } = await client
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[API/users] Error:', error)
        console.error('[API/users] Error details:', JSON.stringify(error, null, 2))
        return NextResponse.json(
          { error: 'ユーザー一覧の取得に失敗しました', details: error.message },
          { status: 500 }
        )
      }

      console.log('[API/users] Fetched users in dev mode:', data?.length || 0)
      return NextResponse.json({ users: data || [] })
    }

    // 本番環境: adminのみ全ユーザー取得、それ以外は自分の情報のみ
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { data: currentUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (currentUser?.role === 'admin') {
      // adminは全ユーザー取得
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[API/users] Error:', error)
        return NextResponse.json(
          { error: 'ユーザー一覧の取得に失敗しました' },
          { status: 500 }
        )
      }

      return NextResponse.json({ users: data || [] })
    } else {
      // それ以外は自分の情報のみ
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('[API/users] Error:', error)
        return NextResponse.json(
          { error: 'ユーザー情報の取得に失敗しました' },
          { status: 500 }
        )
      }

      return NextResponse.json({ users: data ? [data] : [] })
    }
  } catch (error: any) {
    console.error('[API/users] Error:', error)
    return NextResponse.json(
      { error: error.message || 'ユーザー一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// PUT: ユーザー権限更新
export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    // 権限チェック（adminのみ）
    const permissionError = await checkAdminPermission(null)
    if (permissionError) {
      return permissionError
    }

    const body = await request.json()
    const { id, role } = body

    if (!id || !role) {
      return NextResponse.json(
        { error: 'IDと権限は必須です' },
        { status: 400 }
      )
    }

    if (!['admin', 'manager', 'staff'].includes(role)) {
      return NextResponse.json(
        { error: '無効な権限です' },
        { status: 400 }
      )
    }

    // 開発環境では、サービスロールキーを使用してRLSをバイパス
    let client: any
    if (process.env.NODE_ENV === 'development') {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (serviceRoleKey) {
        client = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          serviceRoleKey,
          { auth: { persistSession: false } }
        )
      } else {
        client = await createClient()
      }
    } else {
      client = await createClient()
    }

    const { data, error } = await client
      .from('users')
      .update({ role })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[API/users] PUT Error:', error)
      console.error('[API/users] PUT Error details:', JSON.stringify(error, null, 2))
      return NextResponse.json(
        { error: 'ユーザー権限の更新に失敗しました', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ user: data })
  } catch (error: any) {
    console.error('[API/users] PUT Error:', error)
    return NextResponse.json(
      { error: error.message || 'ユーザー権限の更新に失敗しました' },
      { status: 500 }
    )
  }
}

// POST: ユーザー追加
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    // 権限チェック（adminのみ）
    const permissionError = await checkAdminPermission(null)
    if (permissionError) {
      return permissionError
    }

    const body = await request.json()
    const { email, full_name, role, department } = body

    if (!email) {
      return NextResponse.json(
        { error: 'メールアドレスは必須です' },
        { status: 400 }
      )
    }

    if (role && !['admin', 'manager', 'staff'].includes(role)) {
      return NextResponse.json(
        { error: '無効な権限です' },
        { status: 400 }
      )
    }

    // サービスロールキーが必要（auth.admin.createUserを使用するため）
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      return NextResponse.json(
        { 
          error: 'サービスロールキーが設定されていません',
          hint: '環境変数 SUPABASE_SERVICE_ROLE_KEY を設定してください'
        },
        { status: 500 }
      )
    }

    // サービスロールキーを使用してクライアントを作成
    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      { auth: { persistSession: false } }
    )

    // 既存のユーザーをチェック
    const { data: existingUsers } = await adminClient
      .from('users')
      .select('id, email')
      .eq('email', email)
      .limit(1)

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'このメールアドレスのユーザーは既に存在します' },
        { status: 409 }
      )
    }

    // 認証ユーザーを作成（パスワードはランダム生成、初回ログイン時にリセットが必要）
    const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12) + 'A1!'
    const { data: authUser, error: createAuthError } = await adminClient.auth.admin.createUser({
      email: email,
      password: randomPassword,
      email_confirm: true, // メール確認をスキップ
      user_metadata: {
        full_name: full_name || null,
        department: department || null,
      }
    })

    if (createAuthError || !authUser?.user) {
      console.error('[API/users] POST Error (create auth user):', createAuthError)
      return NextResponse.json(
        { 
          error: '認証ユーザーの作成に失敗しました',
          details: createAuthError?.message || 'Unknown error'
        },
        { status: 500 }
      )
    }

    // usersテーブルにユーザーを追加
    const { data, error } = await adminClient
      .from('users')
      .insert({
        id: authUser.user.id,
        email: email,
        full_name: full_name || null,
        role: role || 'staff',
        department: department || null,
      })
      .select()
      .single()

    if (error) {
      console.error('[API/users] POST Error:', error)
      console.error('[API/users] POST Error details:', JSON.stringify(error, null, 2))
      
      // 既に存在する場合
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'このメールアドレスのユーザーは既に存在します' },
          { status: 409 }
        )
      }
      
      return NextResponse.json(
        { error: 'ユーザーの追加に失敗しました', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ user: data })
  } catch (error: any) {
    console.error('[API/users] POST Error:', error)
    return NextResponse.json(
      { error: error.message || 'ユーザーの追加に失敗しました' },
      { status: 500 }
    )
  }
}
