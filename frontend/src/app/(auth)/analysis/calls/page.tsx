'use client'

export default function CallAnalysisPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e6f7fa' }}>
            <svg className="w-10 h-10" style={{ color: '#0083a0' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          架電分析
        </h1>
        
        <div className="flex items-center justify-center gap-2 mb-4">
          <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
          </svg>
          <span className="text-lg font-medium text-amber-600">開発中</span>
        </div>
        
        <p className="text-gray-600 mb-6">
          架電内容をAI分析し、営業スキルの向上を支援する機能です。
          <br />
          現在開発中のため、もうしばらくお待ちください。
        </p>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-left">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">実装予定の機能</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 架電テキストの取り込み</li>
            <li>• AI分析によるスコアリング</li>
            <li>• SPIN/BANT質問の評価</li>
            <li>• 改善点のフィードバック</li>
            <li>• 個人・チーム分析ダッシュボード</li>
          </ul>
        </div>
      </div>
    </div>
  )
}






