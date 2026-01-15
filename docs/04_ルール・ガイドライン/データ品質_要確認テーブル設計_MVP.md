---
title: "データ品質：要確認（needs_review）テーブル設計（MVP）"
created: 2026-01-15
updated: 2026-01-15
status: draft
tags:
  - REDISH_SFA
  - data-quality
  - needs_review
  - import
  - supabase
---

## 目的

Lenient取り込み（未登録値は止めずに受け入れ）を成立させるために、未登録値をDBに保持し、以下を実現する。

- 取り込み結果画面で要確認（needs_review）を表示できる
- 設定画面のヘルスチェックで要確認を一覧・回収できる
- `setting_key（日本語名）` を併記し、運用時に読める

参照SSOT:
- `docs/04_ルール・ガイドライン/設定キー台帳_DropdownSettings_SSOT.md`
- `docs/04_ルール・ガイドライン/設定メニュー_互換隔離・ヘルスチェック・取り込み要確認_MVP仕様.md`

---

## 決定事項（前提）

- 取り込みポリシー: Lenient（未登録値はフラグで受け入れ）
- 表示: 設定画面＋取り込み結果画面の両方で要確認を表示
- ヘルスチェック対象: dropdown由来キーのみ（MVP）
- 互換セクション: 閲覧のみ（MVP推奨）
- import_runs: 作成する（取り込み実行の単位を持つ）

---

## 決定事項（確定）

- `sample_record_ids` は `lead_id` / `deal_id` を優先して格納する（文字列）
- 集約時の `sample_record_ids` 上限は 20件
- `ignored` は期限なし（解除可能）

## データモデル（MVP）

### 1) import_runs（取り込み実行）

役割:
- 「いつ、どの設定（spreadsheet_configs）で、何件取り込んだか」を保持
- 取り込み結果画面のサマリー表示の正本

推奨スキーマ（案）:

```sql
CREATE TABLE IF NOT EXISTS import_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spreadsheet_config_id UUID REFERENCES spreadsheet_configs(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'partial', 'failed')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  imported_count INTEGER NOT NULL DEFAULT 0,
  needs_review_count INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_import_runs_started_at ON import_runs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_import_runs_spreadsheet_config_id ON import_runs(spreadsheet_config_id);
```

### 2) data_quality_issues（要確認の集約）

役割:
- 未登録値（unknown_option）を「同一問題1行」に集約し、件数・最終観測時刻を更新する
- 設定画面ヘルスチェックの正本

推奨スキーマ（案）:

```sql
CREATE TABLE IF NOT EXISTS data_quality_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  issue_type TEXT NOT NULL CHECK (issue_type IN ('unknown_option')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'ignored')),

  setting_key TEXT NOT NULL,
  setting_key_label_ja TEXT NOT NULL,

  observed_value TEXT NOT NULL,
  normalized_value TEXT NOT NULL,

  source TEXT NOT NULL CHECK (source IN ('spreadsheet_import', 'existing_db_scan')),
  source_ref_id UUID,

  sample_table TEXT,
  sample_column TEXT,
  sample_record_ids JSONB NOT NULL DEFAULT '[]'::jsonb,

  count_total INTEGER NOT NULL DEFAULT 0,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolution_note TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dqi_status_last_seen ON data_quality_issues(status, last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_dqi_setting_key ON data_quality_issues(setting_key);
CREATE INDEX IF NOT EXISTS idx_dqi_source_ref_id ON data_quality_issues(source_ref_id);
```

集約の考え方（アプリ側ロジック）:
- 同一判定キー: `(issue_type, setting_key, normalized_value, status='open')`
- 既存があれば `count_total += N`, `last_seen_at = now()`, `sample_record_ids` を追加（上限あり）
- なければ新規作成

### 3) RLS（方針）

MVPは既存方針に合わせる（authenticatedは全操作可能）。
詳細は実装時に `supabase/migrations` へ反映。

---

## 日本語併記（setting_key_label_ja）について

### 方針

- UIではSSOT辞書を参照して `key（日本語名）` 表示をする
- ただし要確認テーブルにも `setting_key_label_ja` を冗長保持する（運用で読めることを優先）

### 更新ルール（運用）

- 新しい設定キーを追加した場合は、必ずSSOT台帳に追記
- それに伴い、生成される要確認の `setting_key_label_ja` は台帳の文言を使用する

---

## ヘルスチェック対象（MVP候補）

MVPは「dropdown由来キーのみ」。対象カラムの例（案）:

- `call_records.staff_is` → `staffIS（担当IS）`
- `call_records.status_is` → `statusIS（リードステータス（IS））`
- `call_records.recycle_priority` → `recyclePriority（ナーチャリング優先度）`
- `call_records.result_contact_status` → `resultContactStatus（直近架電結果）`
- `call_records.cannot_contact_reason` → `cannotContactReason（対象外/連絡不能 理由（互換））`
- `call_records.action_outside_call` → `actionOutsideCall（架電外アクション）`
- `call_records.next_action_content` → `nextActionContent（ネクストアクション内容）`
- `call_records.deal_staff_fs` → `dealStaffFS（商談担当FS）`
- `call_records.deal_result` → `dealResult（商談結果）`
- `call_records.lost_reason_fs` → `lostReasonFS（失注理由（FS→IS））`
- `call_records.opening_date` → `openingPeriod（開業時期）`

- `deals.deal_staff_fs` → `dealStaffFS（商談担当FS）`
- `deals.next_action_content` → `nextActionContent（ネクストアクション内容）`
- `deals.deal_phase` → `dealPhase（商談フェーズ）`
- `deals.rank_estimate` → `rankEstimate（確度ヨミ）`
- `deals.rank_change` → `rankChange（確度変化）`
- `deals.result` → `dealResult（商談結果）`
- `deals.lost_reason` → `lostReasonFS（失注理由（FS→IS））`（名称の整合は実装時に要確認）
- `deals.feedback_to_is` → `feedbackToIS（ISへのフィードバック）`
- `deals.opening_date` → `openingPeriod（開業時期）`

注:
- 実際のマッピングは実装前に確定し、SSOT台帳・MVP仕様に追記する

---

## 未確定（次に決める）

- （MVP方針は確定済み）必要なら、以下を詳細化する
  - `sample_record_ids` のフォーマット（例：`{ "kind": "lead_id", "value": "TP1234" }` のように構造化するか）
  - “ignored” の解除運用（誰がいつ解除できるか、監査ログを持つか）

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-01-15 | 初版作成（MVPテーブル設計案） |

