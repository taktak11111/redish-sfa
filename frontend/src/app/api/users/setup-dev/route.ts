import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/guard'

/**
 * 開発環境用: 開発ユーザーを管理者として設定
 * 
 * 注意: このエンドポイントは開発環境でのみ使用してください。
 * 本番環境では使用しないでください。
 */
export async function POST(request: NextRequest) {
  // 開発環境でのみ実行可能
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'このエンドポイントは開発環境でのみ使用できます' },
      { status: 403 }
    )
  }

  try {
    const supabase = await createClient()
    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const body = await request.json()
    const { email, role = 'admin' } = body

    if (!email) {
      return NextResponse.json(
        { error: 'メールアドレスは必須です' },
        { status: 400 }
      )
    }

    // usersテーブルを更新または作成
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    if (fetchError) {
      console.error('[API/users/setup-dev] Fetch error:', fetchError)
      return NextResponse.json(
        { error: 'ユーザー情報の取得に失敗しました', details: fetchError.message },
        { status: 500 }
      )
    }

    if (existingUser) {
      // 既存ユーザーを更新
      const { data, error } = await supabase
        .from('users')
        .update({
          role,
          full_name: existingUser.full_name || '開発ユーザー',
          department: existingUser.department || '開発',
          updated_at: new Date().toISOString(),
        })
        .eq('email', email)
        .select()
        .single()

      if (error) {
        console.error('[API/users/setup-dev] Update error:', error)
        return NextResponse.json(
          { error: 'ユーザーの更新に失敗しました', details: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ 
        user: data,
        message: 'ユーザー権限を更新しました'
      })
    } else {
      // 新規ユーザーを作成する場合
      // 注意: usersテーブルはauth.usersテーブルへの外部キー制約があるため、
      // auth.usersテーブルにユーザーが存在する必要があります
      
      // まず、既存のusersテーブルにユーザーが存在するか確認（メールアドレス以外で）
      const { data: anyUser } = await supabase
        .from('users')
        .select('id')
        .limit(1)
        .single()

      // 既存ユーザーが存在する場合、そのユーザーを管理者にする
      if (anyUser) {
        const { data, error } = await supabase
          .from('users')
          .update({
            role: 'admin',
            email: email,
            full_name: '開発ユーザー',
            department: '開発',
            updated_at: new Date().toISOString(),
          })
          .eq('id', anyUser.id)
          .select()
          .single()

        if (error) {
          console.error('[API/users/setup-dev] Update existing user error:', error)
          return NextResponse.json(
            { 
              error: 'ユーザーの更新に失敗しました',
              message: 'Supabaseダッシュボードから手動でユーザーを設定してください',
              details: error.message,
              instructions: '以下のSQLをSupabaseダッシュボードのSQLエディタで実行してください:\n\nUPDATE users SET role = \'admin\' WHERE email = \'' + email + '\';'
            },
            { status: 500 }
          )
        }

        return NextResponse.json({ 
          user: data,
          message: '既存ユーザーを管理者に設定しました'
        })
      }

      // usersテーブルが空の場合、Supabaseダッシュボードから手動で設定する必要がある
      return NextResponse.json(
        { 
          error: 'usersテーブルにユーザーが存在しません',
          message: 'Supabaseダッシュボードから手動でユーザーを設定してください',
          instructions: '詳細な手順は「docs/開発環境初期ユーザー作成手順.md」を参照してください。\n\n' +
            '【簡易手順】\n' +
            '1. Supabaseダッシュボード → Authentication → Users でユーザーを作成（Email: ' + email + '）\n' +
            '2. 作成されたユーザーのUUIDをコピー\n' +
            '3. SQLエディタで以下を実行（UUIDを貼り付け）:\n' +
            '   INSERT INTO users (id, email, full_name, role, department)\n' +
            '   VALUES (\'貼り付けたUUID\', \'' + email + '\', \'開発ユーザー\', \'admin\', \'開発\');'
        },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('[API/users/setup-dev] Error:', error)
    return NextResponse.json(
      { error: error.message || 'ユーザーの設定に失敗しました' },
      { status: 500 }
    )
  }
}
