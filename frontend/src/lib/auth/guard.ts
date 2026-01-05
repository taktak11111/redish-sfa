import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from './options'

/**
 * APIルートの認証ガード
 * 
 * 使用例:
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const authResult = await requireAuth()
 *   if (authResult instanceof NextResponse) {
 *     return authResult // 401エラー
 *   }
 *   const session = authResult
 *   // 認証済み: 既存の処理を続行
 * }
 * ```
 * 
 * 注意: 開発モード（NODE_ENV=development）では認証チェックをスキップします。
 * 本番環境では必ず認証が必要です。
 */
export async function requireAuth() {
  // 開発モードでは認証チェックをスキップ（開発効率のため）
  if (process.env.NODE_ENV === 'development') {
    // ダミーセッションを返す
    return {
      user: {
        name: '開発ユーザー',
        email: 'dev@example.com',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }
  }

  const session = await getServerSession(authOptions)
  
  if (!session) {
    console.log(`[Auth Guard] Unauthorized access attempt at ${new Date().toISOString()}`)
    return NextResponse.json(
      { error: '認証が必要です', code: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }
  
  return session
}

/**
 * 認証エラーレスポンスかどうかを判定
 */
export function isAuthError(result: unknown): result is NextResponse {
  return result instanceof NextResponse
}
