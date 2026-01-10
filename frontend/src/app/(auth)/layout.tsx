'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'

// 開発モード: 認証をスキップ（本番では false に設定）
const DEV_SKIP_AUTH = process.env.NODE_ENV === 'development'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { status } = useSession()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)

  // マウント後にのみ認証チェックを実行（hydration errorを防ぐ）
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // 開発モードでは認証チェックをスキップ
  useEffect(() => {
    if (isMounted && !DEV_SKIP_AUTH && status === 'unauthenticated') {
      router.push('/')
    }
  }, [isMounted, status, router])

  // 開発モードでは認証チェックをスキップして、すぐにレンダリング
  // 本番環境では認証状態をチェック
  if (!DEV_SKIP_AUTH && isMounted) {
    if (status === 'loading') {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
            style={{ borderColor: '#0083a0' }}
          ></div>
        </div>
      )
    }

    if (status === 'unauthenticated') {
      return null // リダイレクト中
    }
  }

  // 開発モードでは認証チェックをスキップして、すぐにレンダリング
  return (
    <div className="flex h-screen bg-gray-50" suppressHydrationWarning>
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}







