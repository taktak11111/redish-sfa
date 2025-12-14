'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Deal } from '@/types/sfa'

type DealFeedbackInput = {
  dealId?: string
  dealSummary: string
  customer: {
    companyName?: string
    contactName?: string
    role?: string
    industry?: string
  }
  customerProblem: string
  proposal: string
  nextAction: string
  transcript?: string
  referenceNotes?: string // 営業書籍/社内ナレッジ等の貼り付け（暫定）
}

type DealFeedbackResponse = {
  meta: {
    usedModel: 'heuristic' | 'anthropic'
    generatedAt: string
    warnings?: string[]
  }
  scores: {
    inputQualityScore: number // 0-10
    deepProposalScore: number // 0-14
  }
  goodPoints: string[]
  improvementPoints: { point: string; nextAction: string }[]
  nextQuestions: string[]
  risks: { risk: string; mitigation: string }[]
  bookInsight?: { title?: string; quote?: string; insight: string }
  handoffCard: {
    purpose: string
    assumptions: string[]
    constraints: string[]
    deliverables: string[]
    openQuestions: string[]
  }
}

function scoreInputQuality(input: DealFeedbackInput): number {
  const hasPurpose = input.proposal.trim().length > 0
  const hasBackground = input.customerProblem.trim().length > 0
  const hasConstraints = Boolean(input.customer?.role?.trim() || input.customer?.industry?.trim())
  const hasCurrent = input.dealSummary.trim().length > 0
  const hasExpected = input.nextAction.trim().length > 0

  const items = [hasPurpose, hasBackground, hasConstraints, hasCurrent, hasExpected]
  // 0-10（各2点）
  return items.reduce((acc, ok) => acc + (ok ? 2 : 0), 0)
}

function formatFeedbackAsMarkdown(res: DealFeedbackResponse): string {
  const lines: string[] = []
  lines.push(`# AI商談FB`)
  lines.push('')
  lines.push(`- 生成: ${res.meta.generatedAt}`)
  lines.push(`- モデル: ${res.meta.usedModel}`)
  lines.push(`- 入力品質スコア: ${res.scores.inputQualityScore}/10`)
  lines.push(`- 深い提案スコア: ${res.scores.deepProposalScore}/14`)
  if (res.meta.warnings?.length) {
    lines.push(`- 注意: ${res.meta.warnings.join(' / ')}`)
  }
  lines.push('')

  lines.push('## ① 良かった点（3つ）')
  res.goodPoints.slice(0, 5).forEach((p) => lines.push(`- ${p}`))
  lines.push('')

  lines.push('## ② 改善点（3つ：次回アクション）')
  res.improvementPoints.slice(0, 5).forEach((p) => {
    lines.push(`- ${p.point}`)
    lines.push(`  - 次回: ${p.nextAction}`)
  })
  lines.push('')

  lines.push('## ③ 次回の質問案（5つ）')
  res.nextQuestions.slice(0, 10).forEach((q) => lines.push(`- ${q}`))
  lines.push('')

  lines.push('## ④ 失注リスク/懸念（3つ）＋対策')
  res.risks.slice(0, 10).forEach((r) => {
    lines.push(`- リスク: ${r.risk}`)
    lines.push(`  - 対策: ${r.mitigation}`)
  })
  lines.push('')

  lines.push('## ⑤ ナレッジからの示唆（営業書籍/社内）')
  if (res.bookInsight) {
    if (res.bookInsight.title) lines.push(`- 出典: ${res.bookInsight.title}`)
    if (res.bookInsight.quote) lines.push(`- 引用: ${res.bookInsight.quote}`)
    lines.push(`- 示唆: ${res.bookInsight.insight}`)
  } else {
    lines.push('- （未設定）')
  }
  lines.push('')

  lines.push('## ⑥ 引き継ぎカード')
  lines.push(`- 目的: ${res.handoffCard.purpose}`)
  lines.push(`- 前提: ${res.handoffCard.assumptions.map((s) => `「${s}」`).join(' / ')}`)
  lines.push(`- 制約: ${res.handoffCard.constraints.map((s) => `「${s}」`).join(' / ')}`)
  lines.push(`- 成果物: ${res.handoffCard.deliverables.map((s) => `「${s}」`).join(' / ')}`)
  lines.push(`- 未解決: ${res.handoffCard.openQuestions.map((s) => `「${s}」`).join(' / ')}`)

  return lines.join('\n')
}

export default function DealFeedbackPage() {
  const [dealIdFromQuery, setDealIdFromQuery] = useState<string>('')
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('dealId') || ''
    setDealIdFromQuery(id)
  }, [])

  const { data: dealsData, isLoading: dealsLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      const response = await fetch('/api/deals')
      if (!response.ok) throw new Error('Failed to fetch deals')
      return response.json()
    },
  })

  const deals = (dealsData?.data as Deal[]) || []

  const [selectedDealId, setSelectedDealId] = useState<string>('')
  const selectedDeal = useMemo(() => {
    if (!selectedDealId) return null
    return deals.find((d: any) => (d.dealId || d.id) === selectedDealId) || null
  }, [deals, selectedDealId])

  const [dealSummary, setDealSummary] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [contactName, setContactName] = useState('')
  const [role, setRole] = useState('')
  const [industry, setIndustry] = useState('')
  const [customerProblem, setCustomerProblem] = useState('')
  const [proposal, setProposal] = useState('')
  const [nextAction, setNextAction] = useState('')
  const [transcript, setTranscript] = useState('')
  const [referenceNotes, setReferenceNotes] = useState('')

  const [result, setResult] = useState<DealFeedbackResponse | null>(null)
  const [resultMarkdown, setResultMarkdown] = useState<string>('')

  // 商談選択 → 既存データからできる範囲でプレフィル
  const handleSelectDeal = (dealId: string) => {
    setSelectedDealId(dealId)
    const d: any = deals.find((x: any) => (x.dealId || x.id) === dealId)
    if (!d) return

    setCompanyName(d.companyName || '')
    setContactName(d.contactName || '')
    setIndustry(d.industry || '')

    const memo = d.dealMemo || d.conversationMemo || ''
    if (memo) setDealSummary(memo)

    const next = d.nextActionContent || ''
    if (next) setNextAction(next)

    setResult(null)
    setResultMarkdown('')
  }

  // ?dealId= で呼ばれた場合は自動選択してプレフィル
  useEffect(() => {
    if (!dealIdFromQuery) return
    if (dealsLoading) return
    if (!deals?.length) return
    if (selectedDealId) return
    handleSelectDeal(dealIdFromQuery)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealIdFromQuery, dealsLoading, deals])

  const input: DealFeedbackInput = {
    dealId: selectedDealId || undefined,
    dealSummary,
    customer: {
      companyName,
      contactName,
      role,
      industry,
    },
    customerProblem,
    proposal,
    nextAction,
    transcript: transcript || undefined,
    referenceNotes: referenceNotes || undefined,
  }

  const inputQualityScore = useMemo(
    () => scoreInputQuality(input),
    [dealSummary, companyName, contactName, role, industry, customerProblem, proposal, nextAction]
  )

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/ai/deal-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const json = await response.json()
      if (!response.ok) throw new Error(json?.error || 'Failed to generate feedback')
      return json as { data: DealFeedbackResponse }
    },
    onSuccess: (data) => {
      setResult(data.data)
      const md = formatFeedbackAsMarkdown(data.data)
      setResultMarkdown(md)
    },
  })

  const saveToDealMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDealId) throw new Error('商談を選択してください')
      if (!resultMarkdown) throw new Error('先にAI商談FBを生成してください')

      const response = await fetch('/api/deals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId: selectedDealId, feedback: resultMarkdown }),
      })
      const json = await response.json()
      if (!response.ok) throw new Error(json?.error || 'Failed to save feedback')
      return json
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI商談FB</h1>
        <p className="mt-1 text-sm text-gray-500">
          商談内容を入力すると、改善点・質問案・次アクション・引き継ぎカードまでテンプレ形式で生成します
        </p>
      </div>

      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">商談を選択（任意）</label>
            <select className="input" value={selectedDealId} onChange={(e) => handleSelectDeal(e.target.value)} disabled={dealsLoading}>
              <option value="">選択しない（手入力）</option>
              {deals.map((d: any) => {
                const id = d.dealId || d.id
                return (
                  <option key={id} value={id}>
                    {id}｜{d.companyName}｜{d.contactName}
                  </option>
                )
              })}
            </select>
            {selectedDeal && (
              <p className="mt-2 text-xs text-gray-500">
                選択中：{(selectedDeal as any).dealId || selectedDeal.id}（{selectedDeal.companyName}）
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">入力品質スコア（0-10）</label>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-gray-100 rounded">
                <div
                  className="h-2 rounded"
                  style={{ width: `${(inputQualityScore / 10) * 100}%`, backgroundColor: '#0083a0' }}
                />
              </div>
              <div className="text-sm font-semibold text-gray-900">{inputQualityScore}/10</div>
            </div>
            <p className="mt-2 text-xs text-gray-500">目的/背景/制約/現状/期待出力 の充足度を簡易採点しています</p>
          </div>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">会社名</label>
            <input className="input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">担当者名</label>
            <input className="input" value={contactName} onChange={(e) => setContactName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">役職/属性（任意）</label>
            <input
              className="input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="例：経営者、店長、個人事業主"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">業種（任意）</label>
            <input className="input" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="例：飲食、美容、物販" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">商談の要約（3〜10行）</label>
          <textarea
            className="input"
            rows={4}
            value={dealSummary}
            onChange={(e) => setDealSummary(e.target.value)}
            placeholder="何を話したか／相手の反応／決まったことを短く"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">顧客課題（顧客の言葉）</label>
          <textarea
            className="input"
            rows={3}
            value={customerProblem}
            onChange={(e) => setCustomerProblem(e.target.value)}
            placeholder="例：資金繰りが不安、開業準備の手順が分からない、税理士選びで迷っている"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">提案内容（何を提案したか）</label>
          <textarea
            className="input"
            rows={3}
            value={proposal}
            onChange={(e) => setProposal(e.target.value)}
            placeholder="例：開業融資サポート、税務顧問、補助金申請"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">次アクション（予定）</label>
          <textarea
            className="input"
            rows={2}
            value={nextAction}
            onChange={(e) => setNextAction(e.target.value)}
            placeholder="例：必要書類リスト送付、次回面談日程調整、見積提示"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">（任意）議事録/文字起こし</label>
          <textarea className="input" rows={4} value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder="音声→文字起こしを貼り付け" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">（任意）参考ナレッジ（営業書籍/社内メモなど）</label>
          <textarea
            className="input"
            rows={3}
            value={referenceNotes}
            onChange={(e) => setReferenceNotes(e.target.value)}
            placeholder="現時点は貼り付け運用。後でPDFナレッジDBと連携します。"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            className="btn"
            style={{ backgroundColor: '#0083a0' }}
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? '生成中...' : 'AI商談FBを生成'}
          </button>

          <button
            className="btn-outline"
            onClick={() => {
              setResult(null)
              setResultMarkdown('')
            }}
          >
            結果をクリア
          </button>

          <button
            className="btn-outline"
            onClick={() => saveToDealMutation.mutate()}
            disabled={saveToDealMutation.isPending || !selectedDealId || !resultMarkdown}
          >
            {saveToDealMutation.isPending ? '保存中...' : '商談に保存（feedback）'}
          </button>
        </div>

        {generateMutation.isError && (
          <div className="mt-2 text-sm text-red-600">{(generateMutation.error as Error)?.message || '生成に失敗しました'}</div>
        )}
        {saveToDealMutation.isError && (
          <div className="mt-2 text-sm text-red-600">{(saveToDealMutation.error as Error)?.message || '保存に失敗しました'}</div>
        )}
        {saveToDealMutation.isSuccess && (
          <div className="mt-2 text-sm" style={{ color: '#0083a0' }}>
            商談（deals.feedback）に保存しました
          </div>
        )}
      </div>

      {result && (
        <div className="card p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">生成結果</h2>
              <p className="text-xs text-gray-500">
                モデル：{result.meta.usedModel} / 深い提案スコア：{result.scores.deepProposalScore}/14
                {result.meta.warnings?.length ? ` / 注意：${result.meta.warnings.join(' / ')}` : ''}
              </p>
            </div>
            <button
              className="btn-outline"
              onClick={async () => {
                await navigator.clipboard.writeText(resultMarkdown)
              }}
            >
              生成結果（Markdown）をコピー
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-4">
              <h3 className="font-semibold text-gray-900 mb-2">① 良かった点</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                {result.goodPoints.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>

            <div className="card p-4">
              <h3 className="font-semibold text-gray-900 mb-2">② 改善点（次回アクション）</h3>
              <div className="space-y-2 text-sm">
                {result.improvementPoints.map((p, i) => (
                  <div key={i} className="border-l-4 pl-3" style={{ borderColor: '#00a4c5' }}>
                    <div className="text-gray-900 font-medium">{p.point}</div>
                    <div className="text-gray-600">次回：{p.nextAction}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-4">
              <h3 className="font-semibold text-gray-900 mb-2">③ 次回の質問案</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                {result.nextQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>

            <div className="card p-4">
              <h3 className="font-semibold text-gray-900 mb-2">④ 失注リスク/懸念＋対策</h3>
              <div className="space-y-2 text-sm">
                {result.risks.map((r, i) => (
                  <div key={i} className="border-l-4 pl-3 border-red-200">
                    <div className="text-gray-900 font-medium">リスク：{r.risk}</div>
                    <div className="text-gray-600">対策：{r.mitigation}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-4 lg:col-span-2">
              <h3 className="font-semibold text-gray-900 mb-2">⑤ ナレッジからの示唆</h3>
              <p className="text-sm text-gray-700">{result.bookInsight?.insight || '（未設定）'}</p>
              {result.bookInsight?.title && <p className="mt-1 text-xs text-gray-500">出典：{result.bookInsight.title}</p>}
              {result.bookInsight?.quote && <p className="mt-1 text-xs text-gray-500">引用：{result.bookInsight.quote}</p>}
            </div>

            <div className="card p-4 lg:col-span-2">
              <h3 className="font-semibold text-gray-900 mb-2">⑥ 引き継ぎカード</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-gray-500">目的</div>
                  <div className="text-gray-900 font-medium">{result.handoffCard.purpose}</div>
                </div>
                <div>
                  <div className="text-gray-500">成果物</div>
                  <ul className="list-disc pl-5 text-gray-700">
                    {result.handoffCard.deliverables.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-gray-500">前提</div>
                  <ul className="list-disc pl-5 text-gray-700">
                    {result.handoffCard.assumptions.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-gray-500">未解決</div>
                  <ul className="list-disc pl-5 text-gray-700">
                    {result.handoffCard.openQuestions.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <details className="mt-2">
            <summary className="cursor-pointer text-sm" style={{ color: '#0083a0' }}>
              Markdown（保存内容）を表示
            </summary>
            <pre className="mt-2 p-4 bg-gray-50 rounded text-xs overflow-auto whitespace-pre-wrap">{resultMarkdown}</pre>
          </details>
        </div>
      )}

      <div className="card p-4 text-xs text-gray-500">
        <p>
          ※ まずはテンプレが“必ず出る”ことを優先したプロトタイプです。環境変数 <code>ANTHROPIC_API_KEY</code>{' '}
          が設定されていない場合は、簡易ロジックで生成します。
        </p>
      </div>
    </div>
  )
}
