import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/guard'

type HealthTarget = {
  table: 'call_records' | 'deals'
  column: string
  settingKey: string
  settingKeyLabelJa: string
}

// MVP: dropdown由来の対象のみ
const HEALTH_TARGETS: HealthTarget[] = [
  { table: 'call_records', column: 'opening_date', settingKey: 'openingPeriod', settingKeyLabelJa: '開業時期' },
  { table: 'call_records', column: 'staff_is', settingKey: 'staffIS', settingKeyLabelJa: '担当IS' },
  { table: 'call_records', column: 'status_is', settingKey: 'statusIS', settingKeyLabelJa: 'リードステータス（IS）' },
  { table: 'call_records', column: 'recycle_priority', settingKey: 'recyclePriority', settingKeyLabelJa: 'ナーチャリング優先度' },
  { table: 'call_records', column: 'result_contact_status', settingKey: 'resultContactStatus', settingKeyLabelJa: '直近架電結果（未架電/不通/通電）' },
  { table: 'call_records', column: 'cannot_contact_reason', settingKey: 'cannotContactReason', settingKeyLabelJa: '対象外/連絡不能 理由（互換）' },
  { table: 'call_records', column: 'action_outside_call', settingKey: 'actionOutsideCall', settingKeyLabelJa: '架電外アクション' },
  { table: 'call_records', column: 'next_action_content', settingKey: 'nextActionContent', settingKeyLabelJa: 'ネクストアクション内容' },
  { table: 'call_records', column: 'deal_staff_fs', settingKey: 'dealStaffFS', settingKeyLabelJa: '商談担当FS' },
  { table: 'call_records', column: 'deal_result', settingKey: 'dealResult', settingKeyLabelJa: '商談結果' },
  { table: 'call_records', column: 'lost_reason_fs', settingKey: 'lostReasonFS', settingKeyLabelJa: '失注理由（FS→IS）' },

  { table: 'deals', column: 'opening_date', settingKey: 'openingPeriod', settingKeyLabelJa: '開業時期' },
  { table: 'deals', column: 'deal_staff_fs', settingKey: 'dealStaffFS', settingKeyLabelJa: '商談担当FS' },
  { table: 'deals', column: 'next_action_content', settingKey: 'nextActionContent', settingKeyLabelJa: 'ネクストアクション内容' },
  { table: 'deals', column: 'deal_phase', settingKey: 'dealPhase', settingKeyLabelJa: '商談フェーズ' },
  { table: 'deals', column: 'rank_estimate', settingKey: 'rankEstimate', settingKeyLabelJa: '確度ヨミ' },
  { table: 'deals', column: 'rank_change', settingKey: 'rankChange', settingKeyLabelJa: '確度変化' },
  { table: 'deals', column: 'result', settingKey: 'dealResult', settingKeyLabelJa: '商談結果' },
  { table: 'deals', column: 'lost_reason', settingKey: 'lostReasonFS', settingKeyLabelJa: '失注理由（FS→IS）' },
  { table: 'deals', column: 'feedback_to_is', settingKey: 'feedbackToIS', settingKeyLabelJa: 'ISへのフィードバック' },
]

function getServiceSupabaseIfAvailable() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createSupabaseClient(url, key, { auth: { persistSession: false } })
}

function normalizeValue(v: unknown): string {
  return String(v ?? '').trim()
}

function isMissingTableError(err: any): boolean {
  const msg = String(err?.message ?? '')
  return msg.includes('does not exist')
}

async function loadAllowedValues(client: any, settingKey: string): Promise<Set<string>> {
  // dropdown_settings は category別に保存されているが、MVPは key 単位で統合して許容値とみなす
  const { data, error } = await client
    .from('dropdown_settings')
    .select('options')
    .eq('key', settingKey)

  if (error) throw error
  const out = new Set<string>()
  for (const row of data || []) {
    const options = (row as any)?.options
    if (Array.isArray(options)) {
      for (const o of options) {
        const nv = normalizeValue((o as any)?.value)
        if (nv) out.add(nv)
      }
    }
  }
  return out
}

async function scanTarget(client: any, target: HealthTarget): Promise<Array<{ value: string; count: number }>> {
  // Supabaseのクエリだけでdistinct+countは扱いづらいので、まずは全件ではなく限定数での安全運用を避けるため、
  // SQL関数を作らずに「distinct取得 → countは後続」でなく、ここでは view/関数無しで "select column" を受けて集計する。
  const { data, error } = await client.from(target.table).select(target.column)
  if (error) throw error
  const counts = new Map<string, number>()
  for (const row of data || []) {
    const v = normalizeValue((row as any)?.[target.column])
    if (!v) continue
    counts.set(v, (counts.get(v) || 0) + 1)
  }
  return Array.from(counts.entries()).map(([value, count]) => ({ value, count }))
}

async function upsertIssues(params: {
  client: any
  sourceRefId: string | null
  target: HealthTarget
  unknowns: Array<{ value: string; count: number }>
}) {
  const { client, sourceRefId, target, unknowns } = params
  const now = new Date().toISOString()

  for (const u of unknowns) {
    const normalized = normalizeValue(u.value)
    const payload = {
      issue_type: 'unknown_option',
      status: 'open',
      setting_key: target.settingKey,
      setting_key_label_ja: target.settingKeyLabelJa,
      observed_value: u.value,
      normalized_value: normalized,
      source: 'existing_db_scan',
      source_ref_id: sourceRefId,
      sample_table: target.table,
      sample_column: target.column,
      sample_record_ids: [],
      count_total: u.count,
      first_seen_at: now,
      last_seen_at: now,
    }

    // 既存openがあればcountを積み増しではなく「最新スナップショット」で上書き（スキャンは現状反映なので）
    await client
      .from('data_quality_issues')
      .upsert(payload, {
        onConflict: 'issue_type,setting_key,normalized_value,status',
      })
  }
}

// POST: DBをスキャンし、未登録値をdata_quality_issuesへ反映（MVP）
export async function POST(_request: NextRequest) {
  try {
    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) return authResult

    const supabase = await createClient()
    const service = getServiceSupabaseIfAvailable()
    const client = process.env.NODE_ENV === 'development' && service ? service : supabase

    // テーブル未作成なら早期リターン
    // dropdown_settings / data_quality_issues / import_runs の存在は実行時に判定
    const results: Array<{
      settingKey: string
      settingKeyLabelJa: string
      unknownValues: Array<{ value: string; count: number }>
    }> = []

    for (const target of HEALTH_TARGETS) {
      const allowed = await loadAllowedValues(client, target.settingKey).catch((e: any) => {
        if (isMissingTableError(e)) return new Set<string>()
        throw e
      })
      const observed = await scanTarget(client, target).catch((e: any) => {
        if (isMissingTableError(e)) return []
        throw e
      })

      const unknowns = observed.filter((o) => !allowed.has(normalizeValue(o.value)))
      if (unknowns.length > 0) {
        results.push({
          settingKey: target.settingKey,
          settingKeyLabelJa: target.settingKeyLabelJa,
          unknownValues: unknowns,
        })
      }
    }

    // data_quality_issues へ upsert（存在しない場合はスキップ）
    try {
      for (const r of results) {
        const targets = HEALTH_TARGETS.filter((t) => t.settingKey === r.settingKey)
        for (const t of targets) {
          await upsertIssues({ client, sourceRefId: null, target: t, unknowns: r.unknownValues })
        }
      }
    } catch (e: any) {
      if (!isMissingTableError(e)) throw e
    }

    return NextResponse.json({ ok: true, results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'ヘルスチェックに失敗しました' }, { status: 500 })
  }
}

