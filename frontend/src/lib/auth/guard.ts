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
 */
export async function requireAuth() {
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
