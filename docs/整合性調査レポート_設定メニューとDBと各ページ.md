# 整合性調査レポート：設定メニューとDBと各ページ

**調査日**: 2026-01-13  
**調査対象**: 設定メニュー、DB（dropdown_settingsテーブル）、各メニューページ（リード、架電、商談、成約・契約）及び各詳細ページ

---

## 調査概要

設定メニュー（`dropdownSettings.ts`）、DB（`dropdown_settings`テーブル）、各メニューページ・詳細ページで使用されているドロップダウン設定の整合性を徹底的に調査しました。

---

## 1. 設定メニューとDBの整合性

### 1.1 カテゴリマッピング

| 設定メニューセクションID | DBカテゴリ | マッピング | 整合性 |
|------------------------|-----------|-----------|--------|
| `call` | `call` | ✅ 一致 | ✅ 整合 |
| `dealManagement` | `deal` | ⚠️ **不一致** | 🔴 **不整合**: 設定メニューは`dealManagement`だが、DBには`deal`として保存される |

**詳細**:
- `settings/page.tsx`の`categoryMap`で`dealManagement` → `deal`に変換されている
- この変換により、設定メニューとDBのカテゴリ名が不一致になっている

### 1.2 設定メニューで定義されている項目とDBへの保存

#### 架電管理セクション（`call` → `call`）

| 設定キー | 設定メニューに存在 | DBカテゴリ | 整合性 |
|---------|------------------|-----------|--------|
| `staffIS` | ✅ | `call` | ✅ 整合 |
| `statusIS` | ✅ | `call` | ✅ 整合 |
| `customerType` | ✅ | `call` | ✅ 整合 |
| `resultContactStatus` | ✅ | `call` | ✅ 整合 |
| `cannotContactReason` | ✅ | `call` | ✅ 整合 |
| `disqualifyReason` | ✅ | `call` | ✅ 整合 |
| `unreachableReason` | ✅ | `call` | ✅ 整合 |
| `lostReasonPrimary` | ✅ | `call` | ✅ 整合 |
| `lostReasonCustomerSub` | ✅ | `call` | ✅ 整合 |
| `lostReasonCompanySub` | ✅ | `call` | ✅ 整合 |
| `lostReasonCompetitorSub` | ✅ | `call` | ✅ 整合 |
| `lostReasonSelfSub` | ✅ | `call` | ✅ 整合 |
| `lostReasonOtherSub` | ✅ | `call` | ✅ 整合 |
| `lostReasonMemoTemplates` | ✅ | `call` | ✅ 整合 |
| `recyclePriority` | ✅ | `call` | ✅ 整合 |
| `actionOutsideCall` | ✅ | `call` | ✅ 整合 |
| `nextActionContent` | ✅ | `call` | ✅ 整合 |
| `improvementCategory` | ✅ | `call` | ✅ 整合 |
| `needTemperature` | ✅ | `call` | ✅ 整合 |

#### 商談管理セクション（`dealManagement` → `deal`）

| 設定キー | 設定メニューに存在 | DBカテゴリ | 整合性 |
|---------|------------------|-----------|--------|
| `dealStaffFS` | ✅ | `deal` | ✅ 整合 |
| `contractStaff` | ✅ | `deal` | ✅ 整合 |
| `meetingStatus` | ✅ | `deal` | ✅ 整合 |
| `dealResult` | ✅ | `deal` | ✅ 整合 |
| `lostReasonFS` | ✅ | `deal` | ✅ 整合 |
| `contractReason` | ✅ | `deal` | ✅ 整合 |
| `feedbackToIS` | ✅ | `deal` | ✅ 整合 |
| `bantBudget` | ✅ | `deal` | ✅ 整合 |
| `bantAuthority` | ✅ | `deal` | ✅ 整合 |
| `bantTimeline` | ✅ | `deal` | ✅ 整合 |
| `competitorStatus` | ✅ | `deal` | ✅ 整合 |
| `selfHandlingStatus` | ✅ | `deal` | ✅ 整合 |
| `bantInfo` | ✅ | `deal` | ✅ 整合（旧項目） |
| `openingPeriod` | ✅ | `deal` | ✅ 整合 |
| `dealPhase` | ✅ | `deal` | ✅ 整合 |
| `rankEstimate` | ✅ | `deal` | ✅ 整合 |
| `rankChange` | ✅ | `deal` | ✅ 整合 |

### 1.3 DBからの取得処理

**`refreshDropdownSettingsFromDB()`の動作**:
1. `/api/dropdown-settings`からDBの設定を取得
2. カテゴリ別に整理された設定を`DropdownSettings`型にマージ
3. `DEFAULT_SETTINGS`をベースに、DBの設定で上書き
4. `localStorage`に保存

**問題点**:
- DBから取得した設定が`DropdownSettings`型に存在しないキーの場合、警告は出るが無視される
- カテゴリ名の不一致（`dealManagement` vs `deal`）により、設定の取得時に混乱が生じる可能性がある

---

## 2. DBと各メニューページの整合性

### 2.1 リード管理ページ

| 使用箇所 | 使用されている設定キー | DBカテゴリ | 整合性 |
|---------|---------------------|-----------|--------|
| `leads/page.tsx` | なし | - | ✅ 問題なし |
| `LeadDetailPanel.tsx` | `openingPeriod` | `deal` | ⚠️ **不整合**: リード管理で使用されているが、DBカテゴリは`deal` |

**詳細**:
- `LeadDetailPanel.tsx`で`openingPeriod`を使用しているが、この設定は商談管理セクション（`deal`カテゴリ）に属している
- リード管理専用のカテゴリが存在しないため、`deal`カテゴリに保存されている

### 2.2 架電管理ページ

| 使用箇所 | 使用されている設定キー | DBカテゴリ | 整合性 |
|---------|---------------------|-----------|--------|
| `calls/page.tsx` | `staffIS` | `call` | ✅ 整合 |
| `CallDetailPanel.tsx` | `staffIS`, `statusIS`, `cannotContactReason`, `customerType`, `disqualifyReason`, `unreachableReason`, `lostReasonPrimary`, `lostReasonCustomerSub`, `lostReasonCompanySub`, `lostReasonCompetitorSub`, `lostReasonSelfSub`, `lostReasonOtherSub`, `lostReasonMemoTemplates`, `recyclePriority`, `resultContactStatus`, `actionOutsideCall`, `nextActionContent`, `dealStaffFS`, `dealResult`, `lostReasonFS`, `openingPeriod`, `improvementCategory`, `needTemperature` | `call`（大部分）<br>`deal`（一部） | ⚠️ **部分的不整合**: `dealStaffFS`, `dealResult`, `lostReasonFS`, `openingPeriod`は`deal`カテゴリだが、架電管理で使用されている |

**詳細**:
- `CallDetailPanel.tsx`で商談関連の設定（`dealStaffFS`, `dealResult`, `lostReasonFS`）を使用している
- これらは`deal`カテゴリに保存されているが、架電管理でも使用されている

### 2.3 商談管理ページ

| 使用箇所 | 使用されている設定キー | DBカテゴリ | 整合性 |
|---------|---------------------|-----------|--------|
| `deals/page.tsx` | `dealStaffFS` | `deal` | ✅ 整合 |
| `DealDetailPanel.tsx` | `staffIS`, `dealStaffFS`, `dealResult`, `lostReasonFS`, `dealPhase`, `rankEstimate`, `rankChange`, `meetingStatus`, `needTemperature`, `contractReason`, `feedbackToIS`, `bantBudget`, `bantAuthority`, `bantTimeline`, `competitorStatus`, `selfHandlingStatus`, `nextActionContent` | `call`（`staffIS`）<br>`deal`（その他） | ⚠️ **部分的不整合**: `staffIS`は`call`カテゴリだが、商談管理で使用されている |

**詳細**:
- `DealDetailPanel.tsx`で`staffIS`（架電管理の設定）を使用している
- これは`call`カテゴリに保存されているが、商談管理でも使用されている

### 2.4 成約・契約管理ページ

| 使用箇所 | 使用されている設定キー | DBカテゴリ | 整合性 |
|---------|---------------------|-----------|--------|
| `contracts/page.tsx` | なし | - | ✅ 問題なし |
| `ContractDetailPanel.tsx` | `contractStaff` | `deal` | ✅ 整合 |

---

## 3. カテゴリ分類の問題点

### 3.1 カテゴリの境界が不明確

**問題**:
- `openingPeriod`（開業時期）は`deal`カテゴリに保存されているが、リード管理（`LeadDetailPanel.tsx`）でも使用されている
- `staffIS`（担当IS）は`call`カテゴリに保存されているが、商談管理（`DealDetailPanel.tsx`）でも使用されている
- `dealStaffFS`, `dealResult`, `lostReasonFS`は`deal`カテゴリに保存されているが、架電管理（`CallDetailPanel.tsx`）でも使用されている

**影響**:
- カテゴリ名だけでは、どのページで使用されているか判断できない
- DBから設定を取得する際、複数のカテゴリを参照する必要がある

**カテゴリ境界の説明**:
- **`call`カテゴリ**: 主に架電管理で使用される設定。ただし、`staffIS`は商談管理でも使用される
- **`deal`カテゴリ**: 主に商談管理で使用される設定。ただし、以下の設定は他のページでも使用される：
  - `openingPeriod`: リード管理（`LeadDetailPanel.tsx`）でも使用
  - `dealStaffFS`, `dealResult`, `lostReasonFS`: 架電管理（`CallDetailPanel.tsx`）でも使用
  - `contractStaff`: 成約・契約管理（`ContractDetailPanel.tsx`）でも使用

**注意**: DBから設定を取得する際は、カテゴリに関係なく`DropdownSettings`型にマージされるため、カテゴリ名の不一致は問題にならない。ただし、設定の管理・保守の観点から、カテゴリ境界を明確化することが推奨される。

### 3.2 カテゴリマッピングの不整合

**問題**:
- 設定メニューのセクションID（`dealManagement`）とDBのカテゴリ名（`deal`）が不一致
- この不一致により、設定の保存・取得時に混乱が生じる可能性がある

---

## 4. DBスキーマとAPIの整合性

### 4.1 DBスキーマ（推測）

`dropdown_settings`テーブルの構造（APIルートから推測）:
- `category`: カテゴリ（`call`, `deal`など）
- `key`: 設定キー（`staffIS`, `statusIS`など）
- `options`: 選択肢の配列（JSON形式）
- `updated_at`: 更新日時
- ユニーク制約: `(category, key)`

### 4.2 APIルートの動作

**GET `/api/dropdown-settings`**:
- DBから全設定を取得
- カテゴリ別に整理して返却
- 形式: `{ settings: { [category]: { [key]: options[] } }, raw: [...] }`

**PUT `/api/dropdown-settings`**:
- カテゴリと設定のペアを受け取る
- 各設定項目を`upsert`で保存
- `onConflict: 'category,key'`で更新

### 4.3 整合性の問題

**問題点**:
1. **カテゴリ名の不一致**: 設定メニューの`dealManagement`がDBでは`deal`として保存される
2. **カテゴリ境界の不明確さ**: 複数のページで使用される設定が特定のカテゴリに属している
3. **型定義との不一致**: DBに存在するが`DropdownSettings`型に存在しないキーが無視される

---

## 5. 各ページでの設定取得方法

### 5.1 設定の取得フロー

```
1. ページ/コンポーネント読み込み
   ↓
2. `getDropdownOptions(key)` 呼び出し
   ↓
3. `getDropdownSettings()` 実行
   ↓
4. localStorage から取得（存在する場合）
   ↓
5. 存在しない場合: `DEFAULT_SETTINGS` を返す
   ↓
6. （オプション）`refreshDropdownSettingsFromDB()` でDBから取得してlocalStorageに保存
```

### 5.2 各ページでの設定取得状況

| ページ/コンポーネント | 設定取得方法 | DB同期 | 整合性 |
|---------------------|------------|--------|--------|
| `leads/page.tsx` | なし | - | ✅ 問題なし |
| `LeadDetailPanel.tsx` | `getDropdownOptions('openingPeriod')` | ❌ 明示的な同期なし | ⚠️ **不整合**: DB更新が反映されない可能性 |
| `calls/page.tsx` | `getDropdownOptions('staffIS')` | ❌ 明示的な同期なし | ⚠️ **不整合**: DB更新が反映されない可能性 |
| `CallDetailPanel.tsx` | `getDropdownOptions(...)` | ❌ 明示的な同期なし | ⚠️ **不整合**: DB更新が反映されない可能性 |
| `deals/page.tsx` | `getDropdownOptions('dealStaffFS')` | ❌ 明示的な同期なし | ⚠️ **不整合**: DB更新が反映されない可能性 |
| `DealDetailPanel.tsx` | `getDropdownOptions(...)` | ❌ 明示的な同期なし | ⚠️ **不整合**: DB更新が反映されない可能性 |
| `contracts/page.tsx` | なし | - | ✅ 問題なし |
| `ContractDetailPanel.tsx` | `getDropdownOptions('contractStaff')` | ❌ 明示的な同期なし | ⚠️ **不整合**: DB更新が反映されない可能性 |

**問題点**:
- ほとんどのページ/コンポーネントで`refreshDropdownSettingsFromDB()`が呼ばれていない
- 設定メニューで変更した設定が、各ページに反映されるまで時間がかかる可能性がある
- `localStorage`の設定が古い場合、DBの最新設定が反映されない

---

## 6. 不整合の重要度分類

### 🔴 重大な不整合

1. **カテゴリ名の不一致**: 設定メニューの`dealManagement`とDBの`deal`が不一致
   - **影響**: 設定の保存・取得時に混乱が生じる可能性
   - **修正**: カテゴリ名を統一するか、マッピングを明確化

2. **DB同期の欠如**: 各ページ/コンポーネントで`refreshDropdownSettingsFromDB()`が呼ばれていない
   - **影響**: 設定メニューで変更した設定が各ページに反映されない
   - **修正**: 各ページ/コンポーネントでDB同期を実装

### 🟡 部分的不整合

1. **カテゴリ境界の不明確さ**: 複数のページで使用される設定が特定のカテゴリに属している
   - **影響**: カテゴリ名だけでは使用箇所が判断できない
   - **修正**: カテゴリを再設計するか、ドキュメント化

2. **型定義との不一致**: DBに存在するが`DropdownSettings`型に存在しないキーが無視される
   - **影響**: 新しい設定キーを追加した際に、型定義を更新し忘れる可能性
   - **修正**: 型定義を自動生成するか、型チェックを強化

### ⚠️ 軽微な不整合

1. **リード管理での`openingPeriod`使用**: リード管理で使用されているが、DBカテゴリは`deal`
   - **影響**: カテゴリ名が直感的でない
   - **修正**: カテゴリを再設計するか、ドキュメント化

---

## 7. 詳細比較表

### 7.1 設定メニューとDBのカテゴリマッピング

| 設定メニューセクション | セクションID | DBカテゴリ | マッピング | 整合性 |
|---------------------|------------|-----------|-----------|--------|
| 架電管理 | `call` | `call` | ✅ 一致 | ✅ 整合 |
| 商談管理 | `dealManagement` | `deal` | ⚠️ 不一致 | 🔴 **不整合** |

### 7.2 各ページで使用されている設定とDBカテゴリ

| 設定キー | 使用ページ | DBカテゴリ | 整合性 |
|---------|----------|-----------|--------|
| `openingPeriod` | リード管理（`LeadDetailPanel.tsx`） | `deal` | ⚠️ **不整合**: リード管理で使用されているが、`deal`カテゴリ |
| `staffIS` | 架電管理（`CallDetailPanel.tsx`）<br>商談管理（`DealDetailPanel.tsx`） | `call` | ⚠️ **部分的不整合**: 商談管理でも使用されているが、`call`カテゴリ |
| `dealStaffFS` | 架電管理（`CallDetailPanel.tsx`）<br>商談管理（`deals/page.tsx`, `DealDetailPanel.tsx`） | `deal` | ⚠️ **部分的不整合**: 架電管理でも使用されているが、`deal`カテゴリ |
| `dealResult` | 架電管理（`CallDetailPanel.tsx`）<br>商談管理（`DealDetailPanel.tsx`） | `deal` | ⚠️ **部分的不整合**: 架電管理でも使用されているが、`deal`カテゴリ |
| `lostReasonFS` | 架電管理（`CallDetailPanel.tsx`）<br>商談管理（`DealDetailPanel.tsx`） | `deal` | ⚠️ **部分的不整合**: 架電管理でも使用されているが、`deal`カテゴリ |
| `contractStaff` | 成約・契約管理（`ContractDetailPanel.tsx`） | `deal` | ✅ 整合 |

### 7.3 DB同期の実装状況

| ページ/コンポーネント | `refreshDropdownSettingsFromDB()`の呼び出し | 整合性 |
|---------------------|------------------------------------------|--------|
| `leads/page.tsx` | ❌ なし | ⚠️ **不整合**: DB同期なし |
| `LeadDetailPanel.tsx` | ❌ なし | ⚠️ **不整合**: DB同期なし |
| `calls/page.tsx` | ❌ なし（`refreshDropdownSettingsFromDB`はインポートされているが使用されていない） | ⚠️ **不整合**: DB同期なし |
| `CallDetailPanel.tsx` | ❌ なし | ⚠️ **不整合**: DB同期なし |
| `deals/page.tsx` | ❌ なし（`refreshDropdownSettingsFromDB`はインポートされているが使用されていない） | ⚠️ **不整合**: DB同期なし |
| `DealDetailPanel.tsx` | ❌ なし | ⚠️ **不整合**: DB同期なし |
| `contracts/page.tsx` | ❌ なし | ⚠️ **不整合**: DB同期なし |
| `ContractDetailPanel.tsx` | ❌ なし | ⚠️ **不整合**: DB同期なし |

---

## 8. 推奨対応方針

### 優先度1（即座に対応）

1. **DB同期の実装**: 各ページ/コンポーネントで`refreshDropdownSettingsFromDB()`を呼び出す
   - ページ読み込み時、または`useEffect`で定期的に同期
   - `localStorage`の設定が古い場合（例：10分以上経過）はDBから取得

2. **カテゴリ名の統一**: 設定メニューの`dealManagement`を`deal`に統一するか、マッピングを明確化
   - オプションA: 設定メニューのセクションIDを`deal`に変更
   - オプションB: マッピングをドキュメント化し、コメントで明記

### 優先度2（要確認・調整）

1. **カテゴリ境界の明確化**: 複数のページで使用される設定のカテゴリを再設計
   - オプションA: 共通設定用のカテゴリ（`common`）を作成
   - オプションB: カテゴリをページ単位に再設計（`lead`, `call`, `deal`, `contract`）

2. **型定義の自動化**: DBの設定キーと`DropdownSettings`型の整合性を自動チェック
   - 型定義をDBスキーマから自動生成
   - または、型チェックを強化して不一致を検出

### 優先度3（将来対応）

1. **カテゴリの再設計**: 使用箇所に基づいてカテゴリを再設計
   - リード管理専用のカテゴリ（`lead`）を作成
   - 共通設定用のカテゴリ（`common`）を作成

---

## 9. まとめ

### 不整合の総数

- 🔴 **重大な不整合**: 2項目
  - カテゴリ名の不一致（`dealManagement` vs `deal`）
  - DB同期の欠如（各ページ/コンポーネント）
- 🟡 **部分的不整合**: 2項目
  - カテゴリ境界の不明確さ
  - 型定義との不一致
- ⚠️ **軽微な不整合**: 1項目
  - リード管理での`openingPeriod`使用

### 優先的に対応すべき項目

1. **DB同期の実装**: 設定メニューで変更した設定が各ページに反映されるようにする
2. **カテゴリ名の統一**: 設定メニューとDBのカテゴリ名を統一するか、マッピングを明確化

### 次のステップ

1. 各ページ/コンポーネントで`refreshDropdownSettingsFromDB()`を実装
2. カテゴリ名の統一またはマッピングの明確化
3. カテゴリ境界の再設計（必要に応じて）
4. テスト実施（設定メニューで変更した設定が各ページに反映されることを確認）

---

**調査完了日**: 2026-01-13  
**調査者**: AI開発CTO
