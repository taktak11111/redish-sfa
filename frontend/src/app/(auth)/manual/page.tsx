'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface ManualSection {
  id: string
  title: string
  icon: React.ReactNode
  badge?: string
  content: React.ReactNode
}

// ステップカードコンポーネント
function StepCard({ number, title, description, time }: { number: number; title: string; description: string; time?: string }) {
  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#0083a0' }}>
        {number}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-gray-900">{title}</h4>
          {time && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {time}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  )
}

// ヒントカードコンポーネント
function TipCard({ type, title, children }: { type: 'tip' | 'warning' | 'info'; title: string; children: React.ReactNode }) {
  const styles = {
    tip: { bg: 'bg-green-50', border: 'border-green-200', icon: '💡', titleColor: 'text-green-800', textColor: 'text-green-700' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: '⚠️', titleColor: 'text-amber-800', textColor: 'text-amber-700' },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'ℹ️', titleColor: 'text-blue-800', textColor: 'text-blue-700' }
  }
  const s = styles[type]
  return (
    <div className={`${s.bg} ${s.border} border rounded-lg p-4 my-4`}>
      <div className={`font-semibold ${s.titleColor} flex items-center gap-2 mb-2`}>
        <span>{s.icon}</span> {title}
      </div>
      <div className={`text-sm ${s.textColor}`}>{children}</div>
    </div>
  )
}

// フローステップコンポーネント
function FlowStep({ steps }: { steps: { label: string; icon?: string }[] }) {
  return (
    <div className="flex items-center justify-center flex-wrap gap-2 py-4">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 flex items-center gap-2">
            {step.icon && <span>{step.icon}</span>}
            {step.label}
          </div>
          {i < steps.length - 1 && (
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </div>
      ))}
    </div>
  )
}

// ショートカットキーコンポーネント
function KeyboardShortcut({ keys, description }: { keys: string[]; description: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">{description}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, i) => (
          <span key={i}>
            <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">{key}</kbd>
            {i < keys.length - 1 && <span className="mx-1 text-gray-400">+</span>}
          </span>
        ))}
      </div>
    </div>
  )
}

// FAQアイテムコンポーネント
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900">{question}</span>
        <svg className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
          {answer}
        </div>
      )}
    </div>
  )
}

// タブコンポーネント
function TabButton({ 
  isActive, 
  onClick, 
  children 
}: { 
  isActive: boolean
  onClick: () => void
  children: React.ReactNode 
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'bg-[#0083a0] text-white shadow-sm'
          : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200'
      }`}
    >
      {children}
    </button>
  )
}

// 設定メニューマニュアルコンテンツ（タブ構造）
function SettingsManualContent({ 
  activeTab, 
  setActiveTab 
}: { 
  activeTab: string
  setActiveTab: (tab: string) => void 
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">⚙️ 設定メニューの設定方法</h2>
      <p className="text-gray-600 mb-6">
        システムの動作やデータ連携に関する設定を行います。<strong>管理者権限が必要</strong>です。
      </p>

      {/* タブナビゲーション */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        <TabButton isActive={activeTab === 'dropdown'} onClick={() => setActiveTab('dropdown')}>
          📝 ドロップダウン設定
        </TabButton>
        <TabButton isActive={activeTab === 'spreadsheet'} onClick={() => setActiveTab('spreadsheet')}>
          📊 スプレッドシート連携
        </TabButton>
        <TabButton isActive={activeTab === 'csv'} onClick={() => setActiveTab('csv')}>
          📄 CSVインポート
        </TabButton>
        <TabButton isActive={activeTab === 'saved'} onClick={() => setActiveTab('saved')}>
          📚 連携済み管理
        </TabButton>
      </div>

      {/* タブコンテンツ */}
      <div>
        {activeTab === 'dropdown' && <DropdownSettingsContent />}
        {activeTab === 'spreadsheet' && <SpreadsheetSettingsContent />}
        {activeTab === 'csv' && <CSVSettingsContent />}
        {activeTab === 'saved' && <SavedSettingsContent />}
      </div>
    </div>
  )
}

// ドロップダウン設定のコンテンツ
function DropdownSettingsContent() {
  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">📝 ドロップダウン項目の編集</h3>
      <p className="text-gray-600 mb-6">担当者名やステータスの選択肢をカスタマイズできます。</p>
      
      <div className="space-y-3 mb-6">
        <StepCard number={1} title="編集モードに入る" description="「編集」ボタンをクリックして編集モードを有効化" time="5秒" />
        <StepCard number={2} title="項目を追加・変更" description="新しい選択肢を追加、または既存の項目を編集" time="1分" />
        <StepCard number={3} title="保存して反映" description="「保存」ボタンで変更を確定。即座にシステム全体に反映されます" time="5秒" />
      </div>

      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
        <h4 className="font-semibold text-gray-900 mb-2">設定可能な項目</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          {['担当IS', 'ISステータス', '対応不可理由', '失注理由', '商談担当FS', '商談結果', '業種', '地域'].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-gray-600">
              <span className="text-gray-400">•</span> {item}
            </div>
          ))}
        </div>
      </div>

      <TipCard type="info" title="管理者向けベストプラクティス">
        <ul className="space-y-1">
          <li>• 担当者の追加/削除は、入退社のタイミングで速やかに更新</li>
          <li>• ステータス項目の変更は、チームに事前周知してから実施</li>
          <li>• 項目名は統一された命名規則で管理すると、後で検索しやすくなります</li>
        </ul>
      </TipCard>
    </div>
  )
}

// スプレッドシート連携のコンテンツ
function SpreadsheetSettingsContent() {
  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">📊 スプレッドシート連携の詳細ガイド</h3>
      
      {/* マッピングとは */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-900 mb-3">📌 カラムマッピングとは？</h4>
        <div className="bg-blue-50 rounded-xl p-5 border-2 border-blue-200">
          <p className="text-sm text-gray-700 mb-4">
            <strong>マッピング</strong>とは、<strong>スプレッドシートの列（A, B, C...）とデータベースのフィールド名を対応付ける</strong>ことです。
          </p>
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="grid grid-cols-3 gap-4 text-sm mb-3">
              <div className="text-center">
                <div className="font-bold text-gray-900 mb-1">スプレッドシート</div>
                <div className="text-xs text-gray-500">A列: 会社名</div>
              </div>
              <div className="flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-900 mb-1">データベース</div>
                <div className="text-xs text-gray-500">company_name</div>
              </div>
            </div>
            <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded border border-gray-200">
              <strong>なぜ必要？</strong><br />
              スプレッドシートの列名は自由（「会社名」「企業名」「法人名」など）ですが、データベースのカラム名は固定（<code className="bg-gray-200 px-1 rounded">company_name</code>）です。
              マッピングで「どの列をどのDBフィールドに保存するか」を指定します。
            </div>
          </div>
        </div>
      </div>

      {/* スプレッドシート連携の手順 */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-900 mb-3">📋 スプレッドシート連携の手順（詳細）</h4>
        <div className="space-y-4">
          <StepCard 
            number={1} 
            title="スプレッドシートの準備" 
            description="Googleスプレッドシートを開き、以下の情報を確認します"
            time="2分"
          />
          <div className="ml-14 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-semibold text-gray-900 mb-2">① スプレッドシートIDの取得</div>
                <div className="bg-white p-3 rounded border border-gray-200 font-mono text-xs">
                  <div className="text-gray-500">スプレッドシートのURL:</div>
                  <div className="mt-1">
                    https://docs.google.com/spreadsheets/d/<span className="bg-yellow-100 px-1 rounded font-bold">16zy6JsMGEXFhfBYROQwyyKwZs0g64Dt99YL8AVxWpoc</span>/edit
                  </div>
                  <div className="mt-2 text-gray-500">↑ この黄色の部分が「スプレッドシートID」です</div>
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-900 mb-2">② シート名の確認</div>
                <div className="bg-white p-3 rounded border border-gray-200">
                  <div className="text-sm text-gray-600">スプレッドシート下部のタブ名を確認（例: <code className="bg-gray-100 px-1 rounded">12.TEMPOS</code>）</div>
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-900 mb-2">③ シートgidの取得（重要）</div>
                <div className="bg-white p-3 rounded border border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">対象のシートタブをクリックして、URLの末尾を確認:</div>
                  <div className="font-mono text-xs bg-gray-100 p-2 rounded">
                    .../edit<span className="bg-yellow-100 px-1 rounded font-bold">#gid=1814739887</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">↑ <code className="bg-gray-200 px-1 rounded">#gid=</code> の後の数字が「シートgid」です</div>
                  <TipCard type="warning" title="列数が正しく表示されない場合">
                    <p className="text-xs">Z列（26列目）以降のデータが表示されない場合は、シートgidを指定してください。これにより、正しいシートからデータを取得できます。</p>
                  </TipCard>
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-900 mb-2">④ ヘッダー行の確認</div>
                <div className="bg-white p-3 rounded border border-gray-200">
                  <div className="text-sm text-gray-600">列名（ヘッダー）が記載されている行番号を確認（通常は1行目、場合によっては5行目など）</div>
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-900 mb-2">⑤ 公開設定の確認</div>
                <div className="bg-white p-3 rounded border border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">スプレッドシートが「リンクを知っている全員」に公開されている必要があります:</div>
                  <ol className="text-xs text-gray-600 space-y-1 ml-4 list-decimal">
                    <li>スプレッドシート右上の「共有」ボタンをクリック</li>
                    <li>「リンクを知っている全員」を選択</li>
                    <li>「閲覧者」を選択して保存</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          <StepCard 
            number={2} 
            title="設定画面で情報を入力" 
            description="設定メニューの「スプレッドシート連携」タブで情報を入力します"
            time="3分"
          />
          <div className="ml-14 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded border border-gray-200">
                  <div className="font-semibold text-gray-900 mb-1">スプレッドシートID</div>
                  <div className="text-xs text-gray-600">①で取得したIDを入力</div>
                </div>
                <div className="bg-white p-3 rounded border border-gray-200">
                  <div className="font-semibold text-gray-900 mb-1">シート名</div>
                  <div className="text-xs text-gray-600">②で確認したタブ名を入力</div>
                </div>
                <div className="bg-white p-3 rounded border border-gray-200">
                  <div className="font-semibold text-gray-900 mb-1">シートgid（オプション）</div>
                  <div className="text-xs text-gray-600">③で取得したgidを入力（Z列以降がある場合）</div>
                </div>
                <div className="bg-white p-3 rounded border border-gray-200">
                  <div className="font-semibold text-gray-900 mb-1">ヘッダー行</div>
                  <div className="text-xs text-gray-600">④で確認した行番号を入力（例: 5）</div>
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <div className="font-semibold text-blue-900 mb-1">「ヘッダーを取得」ボタンをクリック</div>
                <div className="text-xs text-blue-700 mt-1">
                  これでスプレッドシートから列名が読み込まれます
                </div>
              </div>
            </div>
          </div>

          <StepCard 
            number={3} 
            title="カラムマッピングを設定" 
            description="各列をデータベースのフィールドに対応付けます"
            time="5分"
          />
          <div className="ml-14 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="space-y-3 text-sm">
              <div className="bg-white p-4 rounded border border-gray-200">
                <div className="font-semibold text-gray-900 mb-3">マッピング画面の見方</div>
                <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                  <div className="bg-gray-100 p-2 rounded text-center font-semibold">列名（A, B, C...）</div>
                  <div className="bg-gray-100 p-2 rounded text-center font-semibold">スプレッドシートのヘッダー</div>
                  <div className="bg-gray-100 p-2 rounded text-center font-semibold">マッピング先フィールド</div>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-blue-50 p-2 rounded border border-blue-200 font-mono">A</div>
                    <div className="bg-white p-2 rounded border">会社名</div>
                    <div className="bg-green-50 p-2 rounded border border-green-200">
                      <select className="w-full text-xs border-0 bg-transparent" aria-label="マッピング先フィールド（会社名）">
                        <option>会社名 (companyName)</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-blue-50 p-2 rounded border border-blue-200 font-mono">B</div>
                    <div className="bg-white p-2 rounded border">電話番号</div>
                    <div className="bg-green-50 p-2 rounded border border-green-200">
                      <select className="w-full text-xs border-0 bg-transparent" aria-label="マッピング先フィールド（電話番号）">
                        <option>電話番号 (phone) *</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                <div className="font-semibold text-yellow-900 mb-1">💡 自動マッピング機能</div>
                <div className="text-xs text-yellow-800">
                  ヘッダー名が一致する場合は自動でマッピングされます。不一致の場合は手動で選択してください。
                </div>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200">
                <div className="font-semibold text-gray-900 mb-2">必須項目のマッピング</div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>• <strong>会社名または氏名</strong>: <code className="bg-gray-100 px-1 rounded">companyName</code> または <code className="bg-gray-100 px-1 rounded">contactName</code></div>
                  <div>• <strong>電話番号</strong>: <code className="bg-gray-100 px-1 rounded">phone</code>（必須）</div>
                  <div className="mt-2 text-gray-500">その他の項目（メール、住所など）は任意です。</div>
                </div>
              </div>
            </div>
          </div>

          <StepCard 
            number={4} 
            title="連携設定を保存" 
            description="設定を保存して、次回から簡単にインポートできるようにします"
            time="1分"
          />
          <div className="ml-14 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="space-y-3 text-sm">
              <div className="bg-white p-3 rounded border border-gray-200">
                <div className="font-semibold text-gray-900 mb-2">連携済みリストに追加</div>
                <div className="space-y-2 text-xs text-gray-600">
                  <div>• <strong>連携先名</strong>: 識別しやすい名前を入力（例: TEMPOS, OMC）</div>
                  <div>• <strong>リードIDプレフィックス</strong>: リードID生成時に使用（例: TP, OM）</div>
                  <div>• 「連携済みリストに追加」ボタンをクリック</div>
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <div className="font-semibold text-green-900 mb-1">✅ 保存後のメリット</div>
                <div className="text-xs text-green-700">
                  次回からは「連携済一覧」タブから選択するだけで、設定済みのスプレッドシートをすぐにインポートできます。
                </div>
              </div>
            </div>
          </div>

          <StepCard 
            number={5} 
            title="データをインポート" 
            description="マッピング設定を確認して、データをインポートします"
            time="2分"
          />
          <div className="ml-14 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="space-y-3 text-sm">
              <div className="bg-white p-3 rounded border border-gray-200">
                <div className="font-semibold text-gray-900 mb-2">インポート前の確認</div>
                <ul className="text-xs text-gray-600 space-y-1 list-disc ml-4">
                  <li>必須項目（会社名/氏名、電話番号）がマッピングされているか</li>
                  <li>マッピング先フィールドが正しいか</li>
                  <li>スプレッドシートが公開設定になっているか</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <div className="font-semibold text-blue-900 mb-1">「データをインポート」ボタンをクリック</div>
                <div className="text-xs text-blue-700 mt-1">
                  インポート結果が表示されます。成功数、失敗数、エラー内容を確認してください。
                </div>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200">
                <div className="font-semibold text-gray-900 mb-1">重複チェック</div>
                <div className="text-xs text-gray-600">
                  電話番号が既存データと重複している場合、既存レコードが更新されます（新規作成されません）。
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* トラブルシューティング */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-900 mb-3">🔧 よくある問題と解決方法</h4>
        <div className="space-y-3">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-red-50 px-4 py-2 border-b border-red-100">
              <div className="font-semibold text-red-900 text-sm">❌ 「スプレッドシートの取得に失敗しました」</div>
            </div>
            <div className="p-4 text-sm text-gray-700">
              <div className="font-semibold mb-2">原因:</div>
              <ul className="list-disc ml-5 space-y-1 text-xs">
                <li>スプレッドシートが公開設定になっていない</li>
                <li>スプレッドシートIDが間違っている</li>
                <li>シート名が間違っている</li>
              </ul>
              <div className="font-semibold mt-3 mb-2">解決方法:</div>
              <ol className="list-decimal ml-5 space-y-1 text-xs">
                <li>スプレッドシートの「共有」設定を確認（「リンクを知っている全員」に公開）</li>
                <li>スプレッドシートIDを再確認（URLの <code className="bg-gray-100 px-1 rounded">/d/</code> と <code className="bg-gray-100 px-1 rounded">/edit</code> の間）</li>
                <li>シート名を再確認（タブ名と完全一致が必要）</li>
              </ol>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-yellow-50 px-4 py-2 border-b border-yellow-100">
              <div className="font-semibold text-yellow-900 text-sm">⚠️ 「Z列までしか表示されない」</div>
            </div>
            <div className="p-4 text-sm text-gray-700">
              <div className="font-semibold mb-2">原因:</div>
              <div className="text-xs">シートgidが指定されていないため、デフォルトのシート（gid=0）からデータを取得している</div>
              <div className="font-semibold mt-3 mb-2">解決方法:</div>
              <ol className="list-decimal ml-5 space-y-1 text-xs">
                <li>対象のシートタブをクリック</li>
                <li>URLの末尾の <code className="bg-gray-100 px-1 rounded">#gid=数字</code> を確認</li>
                <li>設定画面の「シートgid」フィールドにその数字を入力</li>
                <li>再度「ヘッダーを取得」をクリック</li>
              </ol>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-blue-50 px-4 py-2 border-b border-blue-100">
              <div className="font-semibold text-blue-900 text-sm">ℹ️ 「ヘッダー行が正しく取得できない」</div>
            </div>
            <div className="p-4 text-sm text-gray-700">
              <div className="font-semibold mb-2">原因:</div>
              <div className="text-xs">ヘッダー行の指定が間違っている（例: 5行目がヘッダーなのに1行目を指定している）</div>
              <div className="font-semibold mt-3 mb-2">解決方法:</div>
              <ol className="list-decimal ml-5 space-y-1 text-xs">
                <li>スプレッドシートで列名が記載されている行番号を確認</li>
                <li>設定画面の「ヘッダー行」フィールドに正しい行番号を入力</li>
                <li>「ヘッダーを取得」をクリックして確認</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <TipCard type="info" title="マッピングのベストプラクティス">
        <ul className="space-y-1 text-sm">
          <li>• <strong>列の順序は自由</strong>: スプレッドシートの列順序とDBのフィールド順序は関係ありません</li>
          <li>• <strong>不要な列はマッピングしない</strong>: 「-- マッピングしない --」を選択すると、その列は無視されます</li>
          <li>• <strong>複数のスプレッドシートを管理</strong>: 各連携先（TEMPOS, OMC等）ごとに設定を保存しておくと便利です</li>
          <li>• <strong>定期的なインポート</strong>: スプレッドシートが更新されたら、定期的にインポートを実行してください</li>
        </ul>
      </TipCard>
    </div>
  )
}

// CSVインポートのコンテンツ
function CSVSettingsContent() {
  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">📄 CSVファイルインポートの詳細ガイド</h3>
      
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-900 mb-3">📋 CSVインポートの手順</h4>
        <div className="space-y-4">
          <StepCard 
            number={1} 
            title="CSVファイルの準備" 
            description="インポート用のCSVファイルを準備します"
            time="5分"
          />
          <div className="ml-14 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="space-y-3 text-sm">
              <div className="bg-white p-3 rounded border border-gray-200">
                <div className="font-semibold text-gray-900 mb-2">ファイル形式の要件</div>
                <ul className="text-xs text-gray-600 space-y-1 list-disc ml-4">
                  <li><strong>文字コード</strong>: UTF-8推奨（Excelで保存する場合は「CSV UTF-8（コンマ区切り）」を選択）</li>
                  <li><strong>1行目</strong>: ヘッダー行（列名）として自動認識されます</li>
                  <li><strong>区切り文字</strong>: カンマ（,）</li>
                  <li><strong>改行コード</strong>: CRLF（Windows）またはLF（Mac/Linux）</li>
                </ul>
              </div>
              <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                <div className="font-semibold text-yellow-900 mb-1">⚠️ 注意事項</div>
                <ul className="text-xs text-yellow-800 space-y-1 list-disc ml-4">
                  <li>セル内に改行が含まれる場合は、ダブルクォート（"）で囲む必要があります</li>
                  <li>セル内にカンマが含まれる場合も、ダブルクォートで囲む必要があります</li>
                  <li>BOM付きUTF-8は問題なく読み込めます</li>
                </ul>
              </div>
            </div>
          </div>

          <StepCard 
            number={2} 
            title="CSVファイルを選択" 
            description="設定画面でCSVファイルを選択します"
            time="10秒"
          />
          <div className="ml-14 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="space-y-3 text-sm">
              <div className="bg-white p-3 rounded border border-gray-200">
                <div className="font-semibold text-gray-900 mb-2">操作手順</div>
                <ol className="text-xs text-gray-600 space-y-1 list-decimal ml-4">
                  <li>設定メニューの「スプレッドシート連携」タブを開く</li>
                  <li>「インポート方法」で「CSVファイル」を選択</li>
                  <li>「ファイルを選択」ボタンをクリック</li>
                  <li>CSVファイルを選択して開く</li>
                </ol>
              </div>
            </div>
          </div>

          <StepCard 
            number={3} 
            title="カラムマッピングを設定" 
            description="CSVの各列をデータベースのフィールドに対応付けます"
            time="3分"
          />
          <div className="ml-14 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="space-y-3 text-sm">
              <div className="bg-white p-3 rounded border border-gray-200">
                <div className="font-semibold text-gray-900 mb-2">自動マッピング</div>
                <div className="text-xs text-gray-600">
                  CSVの1行目（ヘッダー行）の列名が、システムのフィールド名と一致する場合は自動でマッピングされます。
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <div className="font-semibold text-blue-900 mb-1">必須項目</div>
                <div className="text-xs text-blue-700 space-y-1">
                  <div>• <strong>会社名または氏名</strong>: <code className="bg-gray-100 px-1 rounded">companyName</code> または <code className="bg-gray-100 px-1 rounded">contactName</code></div>
                  <div>• <strong>電話番号</strong>: <code className="bg-gray-100 px-1 rounded">phone</code></div>
                </div>
              </div>
            </div>
          </div>

          <StepCard 
            number={4} 
            title="データをインポート" 
            description="マッピング設定を確認して、データをインポートします"
            time="1分"
          />
          <div className="ml-14 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="space-y-3 text-sm">
              <div className="bg-white p-3 rounded border border-gray-200">
                <div className="font-semibold text-gray-900 mb-2">インポート前の確認</div>
                <ul className="text-xs text-gray-600 space-y-1 list-disc ml-4">
                  <li>必須項目がマッピングされているか</li>
                  <li>マッピング先フィールドが正しいか</li>
                  <li>データの形式が正しいか（電話番号、日付など）</li>
                </ul>
              </div>
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <div className="font-semibold text-green-900 mb-1">「データをインポート」ボタンをクリック</div>
                <div className="text-xs text-green-700 mt-1">
                  インポート結果が表示されます。成功数、失敗数、エラー内容を確認してください。
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TipCard type="warning" title="インポート時の注意">
        <ul className="space-y-1">
          <li>• <strong>必須項目</strong>: 会社名/店舗名、氏名、電話番号</li>
          <li>• 電話番号はハイフンあり/なしどちらでもOK</li>
          <li>• 重複データは電話番号で自動チェックされます</li>
          <li>• 大量データのインポートは、業務時間外に実施推奨</li>
        </ul>
      </TipCard>
    </div>
  )
}

// 連携済みスプレッドシート管理のコンテンツ
function SavedSettingsContent() {
  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">📚 連携済みスプレッドシートの管理</h3>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-6">
          「連携済一覧」タブでは、保存済みのスプレッドシート連携設定を一覧で確認・管理できます。
          一度設定を保存しておくと、次回から簡単にインポートできます。
        </p>

        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h4 className="font-semibold text-gray-900 mb-4">📋 一覧表示の見方</h4>
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="font-semibold text-gray-900 mb-2 text-sm">表示される情報</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-gray-600">
                <div>• 連携先名（例: TEMPOS）</div>
                <div>• スプレッドシートID</div>
                <div>• シート名</div>
                <div>• ヘッダー行</div>
                <div>• マッピング数</div>
                <div>• 最終インポート日時</div>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="font-semibold text-blue-900 mb-1 text-sm">操作</div>
              <div className="text-xs text-blue-700 space-y-1">
                <div>• <strong>編集</strong>: 設定を変更して再保存</div>
                <div>• <strong>削除</strong>: 連携設定を削除（データは削除されません）</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-900 mb-3">🔄 連携済み設定の編集</h4>
          <div className="space-y-3">
            <StepCard 
              number={1} 
              title="連携済一覧から選択" 
              description="「連携済一覧」タブで、編集したい設定の「編集」ボタンをクリック"
              time="5秒"
            />
            <StepCard 
              number={2} 
              title="設定を変更" 
              description="スプレッドシート連携タブに移動し、設定を変更します"
              time="2分"
            />
            <StepCard 
              number={3} 
              title="更新を保存" 
              description="「連携設定を更新」ボタンをクリックして保存"
              time="5秒"
            />
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-900 mb-3">🗑️ 連携済み設定の削除</h4>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-700 mb-3">
              「削除」ボタンをクリックすると、連携設定が削除されます。
            </div>
            <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
              <div className="font-semibold text-yellow-900 mb-1 text-sm">⚠️ 注意</div>
              <div className="text-xs text-yellow-800">
                設定を削除しても、既にインポートされたデータは削除されません。
                設定を削除した後も、データはシステム内に残ります。
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-900 mb-3">➕ 新しい連携を追加</h4>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-700 mb-3">
              「➕ 新しいスプレッドシート連携を追加」ボタンをクリックすると、
              新しい連携設定を作成できます。
            </div>
            <div className="space-y-2 text-xs text-gray-600">
              <div>• スプレッドシート連携の手順に従って設定を入力</div>
              <div>• 「連携済みリストに追加」ボタンで保存</div>
              <div>• 複数の連携先（TEMPOS, OMC等）を管理できます</div>
            </div>
          </div>
        </div>

        <TipCard type="info" title="連携管理のベストプラクティス">
          <ul className="space-y-1 text-sm">
            <li>• <strong>連携先ごとに設定を保存</strong>: TEMPOS、OMCなど、各連携先ごとに設定を保存しておくと便利です</li>
            <li>• <strong>定期的な設定確認</strong>: スプレッドシートの構造が変更された場合は、設定も更新してください</li>
            <li>• <strong>設定名は分かりやすく</strong>: 連携先名は識別しやすい名前を付けましょう（例: TEMPOS、OMC、Makuake）</li>
            <li>• <strong>リードIDプレフィックス</strong>: 各連携先ごとに異なるプレフィックスを設定すると、リードの出所が分かりやすくなります</li>
          </ul>
        </TipCard>
      </div>
    </div>
  )
}

export default function UserManualPage() {
  const router = useRouter()

  // 旧URL: /manual → /learning のマニュアルタブへ誘導
  useEffect(() => {
    router.replace('/learning?tab=manual')
  }, [router])

  const [activeSection, setActiveSection] = useState<string>('quickstart')
  const [activeSettingsTab, setActiveSettingsTab] = useState<string>('dropdown')

  const manualSections: ManualSection[] = [
    {
      id: 'quickstart',
      title: 'クイックスタート',
      badge: 'おすすめ',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      content: (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🚀 5分でわかるREDISH SFA</h2>
          <p className="text-gray-600 mb-6">
            このクイックスタートガイドで、システムの基本的な使い方をすぐにマスターできます。
          </p>

          {/* 役割別クイックスタート */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 あなたの役割は？</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <div className="text-2xl mb-2">📞</div>
                <h4 className="font-bold text-blue-900 mb-1">インサイドセールス（IS）</h4>
                <p className="text-sm text-blue-700 mb-3">リードへの架電とアポ獲得が主な業務</p>
                <div className="text-xs text-blue-600">
                  <strong>よく使う画面：</strong>
                  <div className="mt-1">架電管理 → リード管理</div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                <div className="text-2xl mb-2">🤝</div>
                <h4 className="font-bold text-green-900 mb-1">フィールドセールス（FS）</h4>
                <p className="text-sm text-green-700 mb-3">商談から成約までを担当</p>
                <div className="text-xs text-green-600">
                  <strong>よく使う画面：</strong>
                  <div className="mt-1">商談管理 → 成約管理</div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                <div className="text-2xl mb-2">📊</div>
                <h4 className="font-bold text-purple-900 mb-1">マネージャー</h4>
                <p className="text-sm text-purple-700 mb-3">チームの進捗管理と分析</p>
                <div className="text-xs text-purple-600">
                  <strong>よく使う画面：</strong>
                  <div className="mt-1">ダッシュボード → 分析</div>
                </div>
              </div>
            </div>
          </div>

          {/* 営業フロー図 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 営業プロセスの全体像</h3>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <FlowStep steps={[
                { label: 'リード獲得', icon: '📥' },
                { label: '架電', icon: '📞' },
                { label: 'アポ獲得', icon: '📅' },
                { label: '商談', icon: '🤝' },
                { label: '成約', icon: '🎉' }
              ]} />
              <div className="mt-4 grid grid-cols-5 gap-2 text-xs text-center text-gray-500">
                <div>アライアンス先から自動取込</div>
                <div>ISが電話でアプローチ</div>
                <div>訪問・商談の約束</div>
                <div>FSが提案・クロージング</div>
                <div>契約締結！</div>
              </div>
            </div>
          </div>

          {/* 最初の5ステップ */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">✅ 最初にやることリスト</h3>
            <div className="space-y-3">
              <StepCard number={1} title="ダッシュボードを確認" description="ログイン後、未架電リードや進行中の商談数を一目でチェック" time="30秒" />
              <StepCard number={2} title="自分の担当リードを確認" description="リード管理画面で、担当ISフィルターを自分の名前に設定" time="1分" />
              <StepCard number={3} title="架電を開始" description="架電管理画面で、リードを選択して電話をかけ、結果を記録" time="都度" />
              <StepCard number={4} title="アポ獲得を登録" description="商談が取れたら、ステータスを「アポ獲得」に変更し、商談日時を入力" time="1分" />
              <StepCard number={5} title="日報を確認" description="分析画面で、本日の架電数やアポ獲得数を振り返り" time="2分" />
            </div>
          </div>

          <TipCard type="tip" title="プロのコツ">
            <p>毎朝ダッシュボードで「未架電リード」の数を確認し、優先順位を決めてから架電を始めると効率的です。</p>
          </TipCard>
        </div>
      )
    },
    {
      id: 'overview',
      title: 'システム概要',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      content: (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">📚 REDISH SFA システム概要</h2>
          <p className="text-gray-600 mb-6">
            本システムは、リードの獲得から商談、成約までの営業プロセスを一元管理し、データに基づいた意思決定を支援する営業支援システム（SFA）です。
          </p>

          {/* システム構成図 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🏗️ システム構成</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-xl border-2 border-blue-200 shadow-sm">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">📊</span> データ管理モジュール
                </h4>
                <ul className="space-y-2">
                  {[
                    { name: 'リード管理', desc: '見込み顧客の情報を一元管理' },
                    { name: '架電管理', desc: '電話アプローチの記録と追跡' },
                    { name: '商談管理', desc: '商談の進捗とステータス管理' },
                    { name: '成約管理', desc: '契約締結した案件の管理' }
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-blue-500 mt-0.5">●</span>
                      <div>
                        <span className="font-medium text-gray-900">{item.name}</span>
                        <span className="text-gray-500"> - {item.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white p-5 rounded-xl border-2 border-green-200 shadow-sm">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">📈</span> 分析モジュール
                </h4>
                <ul className="space-y-2">
                  {[
                    { name: '売上・成約分析', desc: 'KPIとトレンドを可視化' },
                    { name: '架電結果分析', desc: 'IS活動の効果測定' },
                    { name: '商談結果分析', desc: 'FS活動の効果測定' },
                    { name: 'プロセス分析', desc: 'ボトルネックの特定' }
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-green-500 mt-0.5">●</span>
                      <div>
                        <span className="font-medium text-gray-900">{item.name}</span>
                        <span className="text-gray-500"> - {item.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 用語集 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📖 よく使う用語</h3>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <dl className="grid md:grid-cols-2 gap-4">
                {[
                  { term: 'リード', def: '見込み顧客。アライアンス先から取り込まれた連絡先情報' },
                  { term: 'アポイント', def: '商談の約束。電話で獲得した訪問・打ち合わせの予定' },
                  { term: 'ヨミ（ランク）', def: '商談の成約確度をA〜Dで評価したもの' },
                  { term: 'リサイクル', def: '一度失注したが、将来再アプローチする価値のあるリード' },
                  { term: 'IS', def: 'インサイドセールス。電話でアポを獲得する担当' },
                  { term: 'FS', def: 'フィールドセールス。商談・成約を担当' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <dt className="font-bold text-gray-900 whitespace-nowrap">{item.term}:</dt>
                    <dd className="text-sm text-gray-600">{item.def}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <TipCard type="info" title="画面の共通操作">
            <ul className="space-y-1">
              <li>• 左サイドバーのメニューで各機能に移動</li>
              <li>• 一覧の行をクリックすると、右側に詳細パネルが表示</li>
              <li>• 列のヘッダー境界をドラッグして幅を調整可能</li>
            </ul>
          </TipCard>
        </div>
      )
    },
    {
      id: 'leads',
      title: 'リード管理',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      content: (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">👥 リード管理の操作方法</h2>
          <p className="text-gray-600 mb-6">
            アライアンス先から取り込まれた全てのリード情報を一覧で確認・管理します。
          </p>

          {/* 画面の見方 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🖥️ 画面の構成</h3>
            <div className="bg-gray-900 rounded-xl p-4 text-white text-sm font-mono">
              <div className="flex items-center gap-2 mb-4 text-gray-400">
                <span>┌─────────────────────────────────────────────────────────┐</span>
              </div>
              <div className="grid grid-cols-12 gap-2 mb-2">
                <div className="col-span-8 bg-gray-800 rounded p-2 text-center">① 検索・フィルターバー</div>
                <div className="col-span-4 bg-gray-700 rounded p-2 text-center text-xs">② アクションボタン</div>
              </div>
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-8 bg-gray-800 rounded p-3 text-center">③ リード一覧テーブル</div>
                <div className="col-span-4 bg-blue-900 rounded p-3 text-center border-2 border-blue-500">④ 詳細パネル</div>
              </div>
            </div>
          </div>

          {/* 基本操作 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📝 基本操作</h3>
            
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-semibold text-gray-900">
                  🔍 リードを検索する
                </div>
                <div className="p-4 space-y-3">
                  <StepCard number={1} title="検索バーに入力" description="会社名、担当者名、電話番号、メール、リードIDのいずれかを入力" />
                  <StepCard number={2} title="Enterキーで検索実行" description="入力後、Enterキーを押すか検索ボタンをクリック" />
                  <StepCard number={3} title="結果を確認" description="条件に合致するリードが一覧に表示されます" />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-semibold text-gray-900">
                  🎯 フィルターで絞り込む
                </div>
                <div className="p-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="font-medium text-gray-900">ソースフィルター</div>
                      <div className="text-sm text-gray-600">
                        リードの流入元で絞り込み
                        <div className="mt-1 flex flex-wrap gap-1">
                          {['Meetsmore', 'TEMPOS', 'OMC', 'その他'].map(s => (
                            <span key={s} className="px-2 py-0.5 bg-gray-100 rounded text-xs">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="font-medium text-gray-900">ステータスフィルター</div>
                      <div className="text-sm text-gray-600">
                        対応状況で絞り込み
                        <div className="mt-1 flex flex-wrap gap-1">
                          {['未架電', '架電中', 'アポ獲得'].map(s => (
                            <span key={s} className="px-2 py-0.5 bg-gray-100 rounded text-xs">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-semibold text-gray-900">
                  📋 詳細情報を確認・編集する
                </div>
                <div className="p-4 space-y-3">
                  <StepCard number={1} title="行をクリック" description="一覧から確認したいリードの行をクリック" />
                  <StepCard number={2} title="詳細パネルを確認" description="画面右側に詳細情報が表示されます" />
                  <StepCard number={3} title="情報を編集" description="ステータス変更やメモ追加が可能です" />
                </div>
              </div>
            </div>
          </div>

          <TipCard type="tip" title="効率アップのコツ">
            <ul className="space-y-1">
              <li>• 毎朝「未架電」フィルターで優先架電リストを作成</li>
              <li>• ソース別に架電結果を比較し、効果的な流入元を把握</li>
              <li>• 列幅を調整して、よく見る情報を見やすく配置</li>
            </ul>
          </TipCard>
        </div>
      )
    },
    {
      id: 'calls',
      title: '架電管理',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      content: (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">📞 架電管理の操作方法</h2>
          <p className="text-gray-600 mb-6">
            インサイドセールス（IS）のメイン業務画面です。リードへの架電状況を効率的に管理します。
          </p>

          {/* 架電フロー */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 架電の流れ</h3>
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-gray-200">
              <FlowStep steps={[
                { label: 'リード選択', icon: '👆' },
                { label: '電話をかける', icon: '📞' },
                { label: '結果を記録', icon: '✍️' },
                { label: '次回アクション設定', icon: '📅' }
              ]} />
            </div>
          </div>

          {/* コンタクト結果の入力 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📝 架電結果の記録方法</h3>
            <div className="space-y-4">
              <StepCard number={1} title="リードを選択" description="一覧から架電するリードをクリックして詳細パネルを開く" time="5秒" />
              <StepCard number={2} title="コンタクト結果を選択" description="電話の結果を以下から選択します" />
              
              <div className="ml-14 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    { label: '本人通話', icon: '✅', desc: '決裁者・担当者と話せた' },
                    { label: '受付突破', icon: '🚪', desc: '受付を通過、担当者に繋がった' },
                    { label: '受付拒否', icon: '🚫', desc: '受付で断られた' },
                    { label: '不在', icon: '📵', desc: '誰も電話に出なかった' },
                    { label: '折り返し依頼', icon: '↩️', desc: '後日かけ直すよう依頼された' },
                    { label: '番号不通', icon: '❌', desc: '電話番号が使われていない' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-white rounded border border-gray-100">
                      <span>{item.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900">{item.label}</div>
                        <div className="text-xs text-gray-500">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <StepCard number={3} title="対応メモを入力" description="会話内容、ヒアリングした情報、特記事項を記録" />
              <StepCard number={4} title="次回アクションを設定" description="いつ、何をするかを明確に設定して保存" />
            </div>
          </div>

          {/* アポ獲得時の操作 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🎉 アポイント獲得時の操作</h3>
            <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🎯</div>
                <div className="flex-1">
                  <h4 className="font-bold text-green-900 mb-2">商談の約束が取れたら</h4>
                  <ol className="space-y-2 text-sm text-green-800">
                    <li className="flex items-start gap-2">
                      <span className="font-bold">1.</span>
                      <span>ステータスを<strong>「アポ獲得」</strong>に変更</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">2.</span>
                      <span><strong>商談予定日時</strong>を入力（日付と時間）</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">3.</span>
                      <span><strong>商談担当FS</strong>を選択（商談を担当する営業）</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold">4.</span>
                      <span>ヒアリング内容を<strong>メモに詳しく記載</strong>（FSへの引き継ぎ情報）</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          <TipCard type="warning" title="注意事項">
            <ul className="space-y-1">
              <li>• 架電結果は必ずその場で記録してください（後回しにすると忘れます）</li>
              <li>• 「折り返し依頼」の場合は、必ず次回架電日を設定してください</li>
            </ul>
          </TipCard>

          <TipCard type="tip" title="架電のベストプラクティス">
            <ul className="space-y-1">
              <li>• 午前10〜12時、午後14〜16時が繋がりやすい時間帯</li>
              <li>• 3回不在の場合は、異なる時間帯を試す</li>
              <li>• ヒアリングした情報は具体的に記録（予算感、導入時期、課題など）</li>
            </ul>
          </TipCard>
        </div>
      )
    },
    {
      id: 'deals',
      title: '商談管理',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      content: (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🤝 商談管理の操作方法</h2>
          <p className="text-gray-600 mb-6">
            獲得したアポイントの商談進捗を管理します。主にフィールドセールス（FS）が使用します。
          </p>

          {/* 商談フェーズ */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 商談フェーズとは</h3>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                {[
                  { phase: 'ヒアリング', color: 'bg-blue-500', desc: 'ニーズ確認' },
                  { phase: '提案中', color: 'bg-yellow-500', desc: '見積提示' },
                  { phase: 'クロージング', color: 'bg-orange-500', desc: '契約直前' },
                  { phase: '成約/失注', color: 'bg-green-500', desc: '結果確定' }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center flex-1">
                    <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center text-white font-bold mb-2`}>
                      {i + 1}
                    </div>
                    <div className="text-sm font-semibold text-gray-900">{item.phase}</div>
                    <div className="text-xs text-gray-500">{item.desc}</div>
                    {i < 3 && (
                      <div className="absolute" style={{ left: `${(i + 1) * 25}%`, transform: 'translateX(-50%)' }}>
                        →
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ヨミ（ランク）の説明 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 確度ヨミ（ランク）の付け方</h3>
            <p className="text-gray-600 mb-4">商談の成約確度を4段階で評価します。正確なヨミが売上予測の精度を高めます。</p>
            
            <div className="space-y-3">
              {[
                { rank: 'A', percent: '80%', color: 'bg-green-100 border-green-300 text-green-900', criteria: '口頭内諾あり、契約書待ち、発注書待ちなど' },
                { rank: 'B', percent: '50%', color: 'bg-blue-100 border-blue-300 text-blue-900', criteria: '前向きに検討中、予算確保済み、競合との比較中' },
                { rank: 'C', percent: '20%', color: 'bg-yellow-100 border-yellow-300 text-yellow-900', criteria: '興味あり、情報収集段階、タイミング調整中' },
                { rank: 'D', percent: '10%', color: 'bg-red-100 border-red-300 text-red-900', criteria: '反応薄い、予算なし、長期検討、競合優勢' }
              ].map((item, i) => (
                <div key={i} className={`p-4 rounded-lg border-2 ${item.color}`}>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{item.rank}</span>
                      <span className="text-sm opacity-75">({item.percent})</span>
                    </div>
                    <div className="flex-1 text-sm">{item.criteria}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 商談結果の登録 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">✅ 商談結果の登録</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-xl p-5 border-2 border-green-200">
                <div className="text-2xl mb-2">🎉</div>
                <h4 className="font-bold text-green-900 mb-2">成約の場合</h4>
                <ol className="text-sm text-green-800 space-y-1">
                  <li>1. ステータスを「成約」に変更</li>
                  <li>2. 成約金額を入力</li>
                  <li>3. 成約日を確認・修正</li>
                  <li>4. 保存して完了！</li>
                </ol>
              </div>
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <div className="text-2xl mb-2">📋</div>
                <h4 className="font-bold text-gray-900 mb-2">失注の場合</h4>
                <ol className="text-sm text-gray-700 space-y-1">
                  <li>1. ステータスを「失注」に変更</li>
                  <li>2. 失注理由を選択</li>
                  <li>3. リサイクル対象かどうかを判断</li>
                  <li>4. 詳細をメモに記録して保存</li>
                </ol>
              </div>
            </div>
          </div>

          <TipCard type="tip" title="商談成功のポイント">
            <ul className="space-y-1">
              <li>• ISからの引き継ぎメモを商談前に必ず確認</li>
              <li>• 商談後は当日中に結果を記録（鮮度が大事）</li>
              <li>• ヨミは楽観的にならず、客観的な基準で判断</li>
            </ul>
          </TipCard>
        </div>
      )
    },
    {
      id: 'analysis',
      title: '分析機能',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      content: (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">📈 分析機能の使い方</h2>
          <p className="text-gray-600 mb-6">
            営業パフォーマンスを可視化し、改善ポイントを発見します。マネージャーだけでなく、個人の振り返りにも活用できます。
          </p>

          {/* 分析画面一覧 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 分析画面の種類</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { name: '売上・成約分析', icon: '💰', desc: '売上KPI、成約トレンド、営業ファンネル、担当者別実績', color: 'from-green-50 to-emerald-50 border-green-200' },
                { name: '架電結果分析', icon: '📞', desc: 'コンタクト率、アポ獲得率、ソース別効果分析', color: 'from-blue-50 to-cyan-50 border-blue-200' },
                { name: '商談結果分析', icon: '🤝', desc: '成約率、失注理由分析、平均リードタイム', color: 'from-purple-50 to-violet-50 border-purple-200' },
                { name: 'プロセス分析', icon: '🔄', desc: '各ステージの滞留時間、ボトルネック特定', color: 'from-orange-50 to-amber-50 border-orange-200' }
              ].map((item, i) => (
                <div key={i} className={`p-4 rounded-xl bg-gradient-to-br ${item.color} border`}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <h4 className="font-bold text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* KPIの見方 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📐 主要KPIの見方</h3>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">KPI</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">計算式</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">目安</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { kpi: 'コンタクト率', formula: '本人通話数 ÷ 総架電数', target: '30%以上' },
                    { kpi: 'アポ獲得率', formula: 'アポ数 ÷ 本人通話数', target: '20%以上' },
                    { kpi: '成約率', formula: '成約数 ÷ 商談数', target: '30%以上' },
                    { kpi: '平均単価', formula: '総売上 ÷ 成約数', target: '業種による' },
                    { kpi: 'リードタイム', formula: 'リード取得〜成約の日数', target: '30日以内' }
                  ].map((item, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 font-medium text-gray-900">{item.kpi}</td>
                      <td className="px-4 py-3 text-gray-600">{item.formula}</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">{item.target}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 期間の切り替え */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 期間の切り替え方</h3>
            <p className="text-gray-600 mb-3">画面右上のボタンで分析期間を切り替えられます。</p>
            <div className="flex gap-2">
              {['3ヶ月', '6ヶ月', '12ヶ月'].map((period, i) => (
                <button key={i} className={`px-4 py-2 rounded-lg text-sm font-medium ${i === 0 ? 'bg-[#0083a0] text-white' : 'bg-gray-100 text-gray-700'}`}>
                  過去{period}
                </button>
              ))}
            </div>
          </div>

          <TipCard type="info" title="分析活用のヒント">
            <ul className="space-y-1">
              <li>• 週次ミーティングでは過去1ヶ月のトレンドを確認</li>
              <li>• 月次レポートでは過去3ヶ月との比較を行う</li>
              <li>• 担当者別分析で、ベストプラクティスを共有</li>
            </ul>
          </TipCard>
        </div>
      )
    },
    {
      id: 'settings',
      title: '設定メニュー',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      content: null // レンダリング時に動的に設定
    },
    {
      id: 'faq',
      title: 'よくある質問',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      content: (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">❓ よくある質問（FAQ）</h2>
          <p className="text-gray-600 mb-6">
            ユーザーからよく寄せられる質問と回答をまとめました。
          </p>

          <div className="space-y-3">
            <FAQItem 
              question="リードの検索で結果が表示されません" 
              answer="検索キーワードを短くするか、フィルター条件を緩めてみてください。また、全角/半角やスペースの有無も確認してください。それでも見つからない場合は、データが削除されているか、アクセス権限がない可能性があります。" 
            />
            <FAQItem 
              question="架電結果を間違えて登録してしまいました" 
              answer="詳細パネルから該当の架電記録を選択し、「編集」ボタンで内容を修正できます。修正後は必ず「保存」を押してください。" 
            />
            <FAQItem 
              question="商談のヨミ（ランク）はいつ更新すべきですか？" 
              answer="商談の状況が変わるたびに更新してください。特に、①商談後、②お客様から反応があった時、③競合情報を得た時は必ず見直してください。正確なヨミが売上予測の精度を高めます。" 
            />
            <FAQItem 
              question="データのエクスポート（出力）はできますか？" 
              answer="現在、標準機能としてのエクスポートは実装されていません。データの出力が必要な場合は、管理者にご相談ください。" 
            />
            <FAQItem 
              question="他の担当者のデータを見ることはできますか？" 
              answer="権限設定によります。一般ユーザーは自分の担当データのみ、マネージャーはチーム全体のデータを閲覧できます。詳細は管理者にお問い合わせください。" 
            />
            <FAQItem 
              question="システムが重い・動作が遅い場合は？" 
              answer="①ブラウザを再読み込み（F5キー）、②キャッシュをクリア（Ctrl+Shift+Delete）、③別のブラウザで試す、の順に試してください。改善しない場合は管理者にご連絡ください。" 
            />
          </div>

          <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200 text-center">
            <h3 className="font-semibold text-gray-900 mb-2">🙋 質問が見つからない場合</h3>
            <p className="text-sm text-gray-600 mb-4">
              上記にない質問や、システムの不具合については管理者までお問い合わせください。
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 text-sm text-gray-700">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              admin@redish.co.jp
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'shortcuts',
      title: 'ショートカット',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      ),
      content: (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">⌨️ キーボードショートカット</h2>
          <p className="text-gray-600 mb-6">
            よく使う操作をキーボードで素早く実行できます。
          </p>

          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">🔍 検索・ナビゲーション</h3>
            <div className="space-y-1">
              <KeyboardShortcut keys={['/']} description="検索バーにフォーカス" />
              <KeyboardShortcut keys={['Esc']} description="検索バーからフォーカスを外す / パネルを閉じる" />
              <KeyboardShortcut keys={['↑', '↓']} description="一覧の行を選択" />
              <KeyboardShortcut keys={['Enter']} description="選択した行の詳細を開く" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">📝 編集操作</h3>
            <div className="space-y-1">
              <KeyboardShortcut keys={['Ctrl', 'S']} description="編集内容を保存" />
              <KeyboardShortcut keys={['Ctrl', 'Z']} description="入力を元に戻す" />
              <KeyboardShortcut keys={['Tab']} description="次の入力フィールドに移動" />
              <KeyboardShortcut keys={['Shift', 'Tab']} description="前の入力フィールドに移動" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">🌐 ブラウザ操作</h3>
            <div className="space-y-1">
              <KeyboardShortcut keys={['F5']} description="ページを再読み込み" />
              <KeyboardShortcut keys={['Ctrl', 'Shift', 'Delete']} description="キャッシュをクリア" />
              <KeyboardShortcut keys={['Ctrl', 'F']} description="ページ内検索" />
            </div>
          </div>

          <TipCard type="tip" title="効率化のコツ">
            <p>毎日の作業でショートカットを意識して使うと、1日あたり5〜10分の時間短縮になります。特に「/」での検索フォーカスと「Ctrl+S」での保存は必須です！</p>
          </TipCard>
        </div>
      )
    }
  ]

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      {/* ページヘッダー */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, #0083a0, #00a4c5)' }}>
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ユーザーマニュアル</h1>
            <p className="text-sm text-gray-500">REDISH SFA の使い方をわかりやすく解説</p>
          </div>
          <div className="ml-auto">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              📖 v1.0 | 最終更新: 2026-01-07
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* サイドバーナビゲーション */}
        <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto shrink-0 py-4">
          <nav className="space-y-1 px-3">
            {manualSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  activeSection === section.id
                    ? 'bg-gradient-to-r from-[#e6f7fa] to-white text-[#0083a0] shadow-sm border-l-4 border-[#0083a0]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                }`}
              >
                <span className={activeSection === section.id ? 'text-[#0083a0]' : 'text-gray-400'}>
                  {section.icon}
                </span>
                <span className="flex-1 text-left">{section.title}</span>
                {section.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold text-white rounded" style={{ backgroundColor: '#0083a0' }}>
                    {section.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
          
          {/* 進捗インジケーター */}
          <div className="mt-6 mx-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-xs text-gray-500 mb-2">マニュアルの閲覧進捗</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="h-2 rounded-full" style={{ width: '40%', backgroundColor: '#0083a0' }}></div>
            </div>
            <div className="text-xs text-gray-400 mt-1">4 / 10 セクション</div>
          </div>
        </div>

        {/* コンテンツエリア */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-10">
            {activeSection === 'settings' ? (
              <SettingsManualContent 
                activeTab={activeSettingsTab} 
                setActiveTab={setActiveSettingsTab} 
              />
            ) : (
              manualSections.find((s) => s.id === activeSection)?.content
            )}
            
            {/* ナビゲーションボタン */}
            <div className="mt-12 pt-6 border-t border-gray-200 flex items-center justify-between">
              {(() => {
                const currentIndex = manualSections.findIndex(s => s.id === activeSection)
                const prev = currentIndex > 0 ? manualSections[currentIndex - 1] : null
                const next = currentIndex < manualSections.length - 1 ? manualSections[currentIndex + 1] : null
                return (
                  <>
                    {prev ? (
                      <button
                        onClick={() => setActiveSection(prev.id)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        {prev.title}
                      </button>
                    ) : <div />}
                    {next ? (
                      <button
                        onClick={() => setActiveSection(next.id)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                        style={{ backgroundColor: '#0083a0' }}
                      >
                        {next.title}
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ) : <div />}
                  </>
                )
              })()}
            </div>
            
            {/* フッター */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-400">
                ご不明な点は管理者までお問い合わせください。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
