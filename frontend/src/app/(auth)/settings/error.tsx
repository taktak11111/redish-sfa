'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // エラーをログに記録
    console.error('[Settings Error]', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          設定画面でエラーが発生しました
        </h2>
        <p className="text-gray-600 mb-6">
          {error.message || 'ページの読み込み中にエラーが発生しました。'}
        </p>
        <div className="space-y-3">
          <button
            onClick={() => reset()}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            style={{ backgroundColor: '#0083a0' }}
          >
            再試行
          </button>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ダッシュボードに戻る
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-6">
          エラーが続く場合は、ブラウザのキャッシュをクリアしてお試しください。
        </p>
      </div>
    </div>
  )
}
