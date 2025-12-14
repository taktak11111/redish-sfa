import { NextRequest, NextResponse } from 'next/server'

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
  referenceNotes?: string
}

type DealFeedbackResponse = {
  meta: {
    usedModel: 'heuristic' | 'anthropic'
    generatedAt: string
    warnings?: string[]
  }
  scores: {
    inputQualityScore: number
    deepProposalScore: number
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
  return items.reduce((acc, ok) => acc + (ok ? 2 : 0), 0)
}

function heuristicGenerate(input: DealFeedbackInput, extraWarnings: string[] = []): DealFeedbackResponse {
  const warnings: string[] = [...extraWarnings]
  if (!process.env.ANTHROPIC_API_KEY) {
    warnings.push('ANTHROPIC_API_KEY 未設定のため簡易生成（テンプレ）')
  }

  const company = input.customer?.companyName || '（会社名未入力）'
  const contact = input.customer?.contactName || '（担当者未入力）'

  const goodPoints = [
    `顧客（${company} / ${contact}）の状況を要約できている`,
    `次アクションが明記されている（実行に繋がる）`,
    `顧客課題を言語化できている（仮説形成の土台）`,
  ].slice(0, 3)

  const improvementPoints = [
    {
      point: 'BANT（予算・決裁・ニーズ・時期）の抜けを埋める',
      nextAction: '次回で「予算感/意思決定者/期限/検討プロセス」を質問し、議事録に固定項目として残す',
    },
    {
      point: '提案の価値（結果）を具体化し、比較軸を提示する',
      nextAction: '「導入しない場合の損失」「導入した場合の成果」「競合/自己対応との違い」を3点で説明する',
    },
    {
      point: '失注リスクを先に潰すための確認が不足',
      nextAction: '反論（価格/時期/自己対応）を想定し、事前に“検討条件”を合意しておく',
    },
  ]

  const nextQuestions = [
    '今回の意思決定は誰が最終決裁者ですか？同席は可能ですか？',
    '予算感はどのレンジを想定していますか？（上限・下限）',
    '希望時期はいつですか？逆算すると今どこがボトルネックですか？',
    'いま自己対応/他社で進めていることはありますか？何が不安で止まっていますか？',
    '成功の定義は何ですか？（売上/工数/安心/スピードなど）',
  ]

  const risks = [
    {
      risk: '自己対応・競合決定で比較され、差が出ない',
      mitigation: '比較表（自社/自己対応/競合）を作り、成果・リスク・手間で優位を示す',
    },
    {
      risk: '時期が先送りされ熱量が下がる',
      mitigation: '次回の合意事項を“締切付き”で設定（例：◯日までに書類提出）',
    },
    {
      risk: '入力が曖昧で、AIと人の両方が学べない',
      mitigation: '入力テンプレ（目的/背景/制約/現状/期待出力）を必須化する',
    },
  ]

  const bookInsight = input.referenceNotes?.trim()
    ? {
        title: '参考メモ（貼り付け）',
        quote: input.referenceNotes.slice(0, 140) + (input.referenceNotes.length > 140 ? '…' : ''),
        insight:
          '貼り付けたナレッジから「次回の質問案」と「比較軸（差別化）」を抽出し、商談の構造（課題→提案→合意）に組み込むと、学びの再利用が進みます。',
      }
    : {
        insight:
          '営業書籍ナレッジ（PDF）を取り込めるようにし、「反論処理」「質問設計」「合意形成」の“型”を毎回FBに紐付けると、組織の学習曲線が一段上がります。',
      }

  const handoffCard = {
    purpose: '次回商談で「条件合意（BANT）と次アクション確定」を行い、前進させる',
    assumptions: ['顧客課題は現時点では仮説（追加確認が必要）', '意思決定者/予算/時期が未確定（確認が必要）'],
    constraints: [
      input.nextAction ? `次アクション：${input.nextAction}` : '次アクション未入力',
      input.dealId ? `商談ID：${input.dealId}` : '商談IDなし',
    ],
    deliverables: ['次回の質問案（5つ）', '比較表（自社/自己対応/競合）', '合意事項（締切つき）'],
    openQuestions: ['決裁者は誰か？', '予算レンジは？', '時期とボトルネックは？'],
  }

  const inputQualityScore = scoreInputQuality(input)
  const deepProposalScore = Math.min(14, Math.max(0, Math.round((inputQualityScore / 10) * 10)))

  return {
    meta: {
      usedModel: 'heuristic',
      generatedAt: new Date().toISOString(),
      warnings: warnings.length ? warnings : undefined,
    },
    scores: {
      inputQualityScore,
      deepProposalScore,
    },
    goodPoints,
    improvementPoints,
    nextQuestions,
    risks,
    bookInsight,
    handoffCard,
  }
}

function safeJsonParse<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

async function anthropicGenerate(input: DealFeedbackInput): Promise<DealFeedbackResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return heuristicGenerate(input)

  const system = `あなたはB2B営業のコーチです。出力は必ずJSONのみ。余計な文章は禁止。\n\n目的: 商談の振り返りを通じて、次回の質を上げ、組織の学習スパイラルを回す。\n\n要件:\n- goodPointsは3つ\n- improvementPointsは3つ（pointとnextAction）\n- nextQuestionsは5つ\n- risksは3つ（riskとmitigation）\n- bookInsightはreferenceNotesがあればそれに寄せ、なければ一般化してもよい\n- handoffCardはpurpose/assumptions/constraints/deliverables/openQuestions\n- scores.inputQualityScoreは0-10、scores.deepProposalScoreは0-14\n\nJSONスキーマ: { meta, scores, goodPoints, improvementPoints, nextQuestions, risks, bookInsight, handoffCard }`

  const payload = {
    model: 'claude-3-5-sonnet-latest',
    max_tokens: 1200,
    temperature: 0.3,
    system,
    messages: [{ role: 'user', content: JSON.stringify(input) }],
  }

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(payload),
  })

  if (!resp.ok) {
    const text = await resp.text()
    return heuristicGenerate(input, [`Anthropic呼び出し失敗: ${resp.status}`, text.slice(0, 200)])
  }

  const data: any = await resp.json()
  const text = data?.content?.find((c: any) => c.type === 'text')?.text
  if (!text) return heuristicGenerate(input, ['Anthropic応答にtextがありません（フォールバック）'])

  const parsed = safeJsonParse<DealFeedbackResponse>(text)
  if (!parsed) return heuristicGenerate(input, ['AnthropicのJSONパースに失敗（フォールバック）'])

  return {
    ...parsed,
    meta: {
      ...(parsed.meta || {}),
      usedModel: 'anthropic',
      generatedAt: new Date().toISOString(),
    },
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as DealFeedbackInput

    if (!body?.dealSummary || !body?.customerProblem || !body?.proposal || !body?.nextAction) {
      return NextResponse.json(
        {
          error: '必須項目が不足しています（商談要約 / 顧客課題 / 提案内容 / 次アクション）',
        },
        { status: 400 }
      )
    }

    const data = await anthropicGenerate(body)
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json(
      {
        error: 'AI商談FBの生成に失敗しました',
        details: e?.message,
      },
      { status: 500 }
    )
  }
}
