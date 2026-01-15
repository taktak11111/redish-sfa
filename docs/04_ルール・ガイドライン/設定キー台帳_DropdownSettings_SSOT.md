---
title: "設定キー台帳（DropdownSettings）SSOT"
created: 2026-01-15
updated: 2026-01-15
status: active
tags:
  - REDISH_SFA
  - settings
  - dropdown_settings
  - SSOT
---

## 目的

SFAの「設定メニュー（ドロップダウン選択肢）」に関する正本（SSOT）。

- 設定キー（DB上の英語名）と日本語名を常に併記し、運用・引継ぎ・事故対応の認知負荷を下げる
- 旧互換（レガシー）を隔離して、誤選択と不整合を防ぐ
- シート連携（実データ投入）で未登録値が混入した際に、必ず可視化・回収できる運用を定義する

---

## 適用範囲

- 設定メニュー: `frontend/src/app/(auth)/settings/page.tsx`
- 設定定義（実装の実質SSOT）: `frontend/src/lib/dropdownSettings.ts`
- DB: `dropdown_settings` テーブル（`category` + `key` 単位で `options` を保持）

---

## 用語

- 設定キー: DB上の英語名（例: `statusIS`）
- 日本語名: UI・台帳・ログで併記する名称（例: `リードステータス（IS）`）
- 旧互換: 過去データ表示のために残す値またはキー（新規運用では原則使用しない）
- 未登録値: 取り込みや過去データに存在するが、現行の選択肢（許容値）に存在しない値

---

## 決定事項（2026-01-15）

### 1. 旧互換として隔離する Top5（確定）

以下は「互換セクション」に隔離し、デフォルト非表示（折りたたみ）とする。

- `cannotContactReason（対象外/連絡不能 理由（互換））`
- `lostReasonMemoTemplates（（旧）備忘テンプレ（互換））`
- `bantInfo（BANT（旧・互換））`
- `statusIS（リードステータス（IS））` のうち「（旧）」表記の選択肢
- `recyclePriority（ナーチャリング優先度）` と `resultContactStatus（直近架電結果）` のうち「（旧）」表記の選択肢

運用方針:
- 旧互換は削除しない（過去データ表示のため）
- 新規入力では原則選べない（UI上は非表示か、互換セクション内に限定）

### 2. 取り込みポリシー（Lenient）

未登録値は「フラグで受け入れ」し、必ず可視化・回収する。

- 受け入れ時に `needs_review（要確認）` を立てる
- 要確認は「設定メニューのヘルスチェック」と「取り込み結果画面」で可視化する
- 未解決の要確認がある状態での追加取り込みは、強い警告を出す（止めるかは運用で選択）

---

## 日本語併記（辞書）

### 表示ルール（必須）

- UI、台帳、ログでは常に `key（日本語名）` の形式で表記する
- 互換枠は日本語名に `（互換）` を付ける

### 辞書（キー → 日本語名）

#### 架電管理（settingsセクション: call / DBカテゴリ: call）

| key | 日本語名 |
|---|---|
| staffIS | 担当IS |
| statusIS | リードステータス（IS） |
| customerType | 顧客区分（属性） |
| resultContactStatus | 直近架電結果（未架電/不通/通電） |
| cannotContactReason | 対象外/連絡不能 理由（互換） |
| disqualifyReason | 対象外（Disqualified）理由 |
| unreachableReason | 連絡不能（Unreachable）理由 |
| lostReasonPrimary | 失注主因（顧客/自社/競合/自己対応/その他） |
| lostReasonCustomerSub | 失注サブ理由（顧客要因） |
| lostReasonCompanySub | 失注サブ理由（自社要因） |
| lostReasonCompetitorSub | 失注サブ理由（競合要因） |
| lostReasonSelfSub | 失注サブ理由（自己対応） |
| lostReasonOtherSub | 失注サブ理由（その他） |
| lostReasonMemoTemplates | （旧）備忘テンプレ（互換） |
| recyclePriority | ナーチャリング優先度 |
| actionOutsideCall | 架電外アクション |
| nextActionContent | ネクストアクション内容 |
| improvementCategory | 改善・学習カテゴリ |
| needTemperature | ニーズ温度（IS判定） |

#### 商談管理（settingsセクション: dealManagement / DBカテゴリ: deal）

| key | 日本語名 |
|---|---|
| dealStaffFS | 商談担当FS |
| contractStaff | 契約担当者 |
| meetingStatus | 商談実施状況 |
| dealResult | 商談結果 |
| lostReasonFS | 失注理由（FS→IS） |
| contractReason | 成約要因 |
| feedbackToIS | ISへのフィードバック |
| bantBudget | BANT（予算） |
| bantAuthority | BANT（決裁権） |
| bantTimeline | BANT（導入時期） |
| competitorStatus | 競合状況 |
| selfHandlingStatus | 自己対応状況 |
| bantInfo | BANT（旧・互換） |
| openingPeriod | 開業時期 |
| dealPhase | 商談フェーズ |
| rankEstimate | 確度ヨミ |
| rankChange | 確度変化 |

---

## 台帳（運用・互換・固定）

凡例:
- 分類: 運用 / 互換 / 固定（設定外候補）
- リスク: 低 / 中 / 高（不整合の起きやすさ）

| key（日本語名） | 分類 | 主な使用箇所（例） | 不整合リスク | 方針（削除/改名） |
|---|---|---|---|---|
| staffIS（担当IS） | 運用 | Call/Deal | 中 | 削除禁止。必要なら廃止運用 |
| statusIS（リードステータス（IS）） | 運用＋互換混在 | Call/Deal | 高 | 旧値は互換隔離。改名はマッピング前提 |
| customerType（顧客区分（属性）） | 運用 | Call | 中 | 削除禁止。廃止運用 |
| resultContactStatus（直近架電結果） | 運用＋互換混在 | Call | 中 | 旧値は互換隔離 |
| cannotContactReason（対象外/連絡不能 理由（互換）） | 互換 | Call | 高 | 互換隔離。新規入力では使用しない |
| disqualifyReason（対象外（Disqualified）理由） | 運用 | Call | 中 | 削除禁止。廃止運用 |
| unreachableReason（連絡不能（Unreachable）理由） | 運用 | Call | 中 | 削除禁止。廃止運用 |
| lostReasonPrimary（失注主因） | 運用 | Call | 中 | 削除禁止。廃止運用 |
| lostReasonCustomerSub（失注サブ理由（顧客要因）） | 運用 | Call | 中 | 同上 |
| lostReasonCompanySub（失注サブ理由（自社要因）） | 運用 | Call | 中 | 同上 |
| lostReasonCompetitorSub（失注サブ理由（競合要因）） | 運用 | Call | 中 | 同上（旧値マッピングあり） |
| lostReasonSelfSub（失注サブ理由（自己対応）） | 運用 | Call | 中 | 同上 |
| lostReasonOtherSub（失注サブ理由（その他）） | 運用 | Call | 低〜中 | 同上 |
| lostReasonMemoTemplates（（旧）備忘テンプレ（互換）） | 互換 | Call | 中 | 互換隔離。新規入力では使用しない |
| recyclePriority（ナーチャリング優先度） | 運用＋互換混在 | Call | 中 | 旧値は互換隔離 |
| actionOutsideCall（架電外アクション） | 運用 | Call | 低 | 削除禁止。廃止運用 |
| nextActionContent（ネクストアクション内容） | 運用 | Call/Deal | 中 | 削除禁止。廃止運用 |
| improvementCategory（改善・学習カテゴリ） | 運用 | Call | 低 | 削除禁止。廃止運用 |
| needTemperature（ニーズ温度（IS判定）） | 運用 | Call/Deal | 中 | 表記ゆれ対策（trim/重複禁止） |
| dealStaffFS（商談担当FS） | 運用 | Call/Deal | 中 | 削除禁止。廃止運用 |
| contractStaff（契約担当者） | 運用 | Contract | 低 | 削除禁止。廃止運用 |
| meetingStatus（商談実施状況） | 運用 | Deal | 中 | 改名はマッピング前提 |
| dealResult（商談結果） | 運用 | Call/Deal | 高 | 値体系は固定化し、原則改名しない |
| lostReasonFS（失注理由（FS→IS）） | 運用 | Call/Deal | 中 | 値体系の固定化推奨 |
| contractReason（成約要因） | 運用 | Deal | 低〜中 | 削除禁止。廃止運用 |
| feedbackToIS（ISへのフィードバック） | 運用 | Deal | 中 | IS側の運用と整合ルールを別途定義 |
| bantBudget（BANT（予算）） | 運用 | Deal | 中 | 不明/確認中など状態値を必ず含める |
| bantAuthority（BANT（決裁権）） | 運用 | Deal | 中 | 同上 |
| bantTimeline（BANT（導入時期）） | 運用 | Deal | 中 | 表記ゆれ対策が重要 |
| competitorStatus（競合状況） | 運用 | Deal | 中 | なし/不明の扱いを固定 |
| selfHandlingStatus（自己対応状況） | 運用 | Deal | 中 | なし/不明の扱いを固定 |
| bantInfo（BANT（旧・互換）） | 互換 | settings | 低 | 互換隔離。新規入力では使用しない |
| openingPeriod（開業時期） | 運用 | Lead/Call | 高 | 取り込みの自由記述との衝突に注意 |
| dealPhase（商談フェーズ） | 運用 | Deal | 中 | 使う状態数を先に確定 |
| rankEstimate（確度ヨミ） | 運用 | Deal | 低〜中 | 値固定化しやすい |
| rankChange（確度変化） | 運用 or 廃止候補 | Deal | 低 | 本当に使うか別途決定 |

---

## 不整合防止（仕様案）

### 1. 設定保存前チェック（最低限）

- 空文字を禁止
- 前後空白を除去した上で重複を禁止
- 互換枠（Top5）はデフォルト非表示とし、通常編集の導線から外す

### 2. ヘルスチェック（設定画面に追加する想定）

目的:
- DB内の実値と「許容値」を突合して、未登録値を可視化・回収する

出力例（概念）:
- 対象キー: `openingPeriod（開業時期）`
- 未登録値: 値, 件数, 初出日
- 対応: 許容値に追加 / 旧→新マッピング登録 / 取り込み側で変換

### 3. 取り込み（Lenient）運用

- 未登録値を見つけたら、取り込みは継続しつつ `needs_review（要確認）` を立てる
- 要確認の一覧は、設定画面のヘルスチェックと取り込み結果で必ず確認できる導線にする

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-01-15 | 初版作成（日本語併記辞書、Top5隔離、Lenient取り込み方針、台帳ドラフト） |

