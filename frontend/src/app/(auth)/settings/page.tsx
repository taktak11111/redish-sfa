'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

// テスト用：useSession追加
export default function SettingsPage() {
  const [mounted, setMounted] = useState(false)
  const { data: session, status } = useSession()
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div 
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
          style={{ borderColor: '#0083a0' }}
        ></div>
      </div>
    )
  }
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">設定画面テスト（useSession追加）</h1>
      <p className="mt-4 text-gray-600">
        このメッセージが表示されれば、useSessionは正常です。
      </p>
      <p className="mt-2 text-sm text-gray-500">
        マウント状態: {mounted ? 'true' : 'false'}
      </p>
      <p className="mt-2 text-sm text-gray-500">
        セッション状態: {status}
      </p>
      <p className="mt-2 text-sm text-gray-500">
        ユーザー: {session?.user?.email || 'なし'}
      </p>
    </div>
  )
}
