'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'

// 開発モード: 認証をスキップ（本番では false に設定）
const DEV_SKIP_AUTH = process.env.NODE_ENV === 'development'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { status } = useSession()

  // 開発モードでは認証チェックをスキップ
  if (!DEV_SKIP_AUTH) {
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
      redirect('/')
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






