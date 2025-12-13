'use client'

export default function LearningCenterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e6f7fa' }}>
            <svg className="w-10 h-10" style={{ color: '#0083a0' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          学習センター
        </h1>
        
        <div className="flex items-center justify-center gap-2 mb-4">
          <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
          </svg>
          <span className="text-lg font-medium text-amber-600">開発中</span>
        </div>
        
        <p className="text-gray-600 mb-6">
          営業スキル向上のための学習コンテンツを提供し、
          <br />
          成長を可視化する機能です。
          <br />
          現在開発中のため、もうしばらくお待ちください。
        </p>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-left">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">実装予定の機能</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 学習コンテンツ一覧</li>
            <li>• 進捗トラッキング</li>
            <li>• 分析結果に基づく推奨学習</li>
            <li>• バッジ獲得システム</li>
            <li>• 学習ストリーク</li>
          </ul>
        </div>
        
        <div className="mt-6 bg-blue-50 rounded-lg border border-blue-200 p-4 text-left">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">📚 学習カテゴリ</h3>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-white rounded p-2 text-center">
              <div className="font-semibold text-gray-900">マインドセット</div>
              <div className="text-gray-500">45点</div>
            </div>
            <div className="bg-white rounded p-2 text-center">
              <div className="font-semibold text-gray-900">スキル</div>
              <div className="text-gray-500">30点</div>
            </div>
            <div className="bg-white rounded p-2 text-center">
              <div className="font-semibold text-gray-900">知識</div>
              <div className="text-gray-500">25点</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}






