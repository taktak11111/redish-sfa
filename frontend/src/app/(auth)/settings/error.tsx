'use client'

import { useEffect, useState } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [showDetails, setShowDetails] = useState(false)
  
  useEffect(() => {
    // エラーをログに記録（詳細含む）
    console.error('[Settings Error] Message:', error.message)
    console.error('[Settings Error] Name:', error.name)
    console.error('[Settings Error] Stack:', error.stack)
    console.error('[Settings Error] Digest:', error.digest)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          設定画面でエラーが発生しました
        </h2>
        <p className="text-gray-600 mb-4">
          {error.message || 'ページの読み込み中にエラーが発生しました。'}
        </p>
        
        {/* デバッグ用：エラー詳細表示 */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-600 hover:underline mb-4"
        >
          {showDetails ? 'エラー詳細を隠す' : 'エラー詳細を表示'}
        </button>
        
        {showDetails && (
          <div className="text-left bg-gray-100 p-4 rounded-lg mb-4 overflow-auto max-h-64">
            <p className="text-xs font-mono text-gray-700 whitespace-pre-wrap break-all">
              <strong>Name:</strong> {error.name}
              {'\n\n'}
              <strong>Message:</strong> {error.message}
              {'\n\n'}
              <strong>Digest:</strong> {error.digest || 'N/A'}
              {'\n\n'}
              <strong>Stack:</strong>
              {'\n'}{error.stack || 'N/A'}
            </p>
          </div>
        )}
        
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
