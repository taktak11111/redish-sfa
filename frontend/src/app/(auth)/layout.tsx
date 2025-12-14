'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { useEffect } from 'react'

// 開発モード: 認証をスキップ（本番では false に設定）
const DEV_SKIP_AUTH = process.env.NODE_ENV === 'development'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (DEV_SKIP_AUTH) return
    if (status === 'unauthenticated') {
      router.replace('/')
    }
  }, [router, status])

  // 開発モードでは認証チェックをスキップ
  if (!DEV_SKIP_AUTH) {
    if (status === 'loading') {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div
            className="animate-spin rounded-full border-t-2 border-b-2"
            style={{ width: 48, height: 48, borderColor: '#0083a0' }}
          />
        </div>
      )
    }

    if (status === 'unauthenticated') {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div style={{ color: '#00627b' }} className="text-sm">
            認証が必要です。ログイン画面へ移動しています…
          </div>
        </div>
      )
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
