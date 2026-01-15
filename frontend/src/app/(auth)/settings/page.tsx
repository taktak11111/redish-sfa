'use client'

import dynamic from 'next/dynamic'

// 設定画面をクライアントサイドでのみ読み込む（SSR完全スキップ）
const SettingsContent = dynamic(() => import('./SettingsContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div 
        className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
        style={{ borderColor: '#0083a0' }}
      ></div>
    </div>
  ),
})

export default function SettingsPage() {
  return <SettingsContent />
}
