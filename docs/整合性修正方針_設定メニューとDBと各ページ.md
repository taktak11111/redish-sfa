# 整合性修正方針：設定メニューとDBと各ページ

**作成日**: 2026-01-13  
**対象**: 整合性調査レポートで指摘された全ての不整合の修正

---

## 修正方針の基本原則

1. **既存実装への影響を最小化**: 既存の動作を維持しつつ、不整合を修正する
2. **後方互換性の維持**: 既存のDBデータやlocalStorageの設定との互換性を保つ
3. **段階的実装**: 優先度1（重大な不整合）から順に対応
4. **安全な実装**: 各修正後に動作確認を実施

---

## 修正内容の詳細

### 🔴 優先度1: 重大な不整合の修正

#### 1.1 DB同期の実装

**現状**:
- 各ページ/コンポーネントで`refreshDropdownSettingsFromDB()`が呼ばれていない
- 設定メニューで変更した設定が各ページに反映されない可能性がある

**修正方針**: **既存の動作を維持しつつ、DB同期を追加**

**修正内容**:

1. **各ページ/コンポーネントでDB同期を実装**:
   - ページ読み込み時（`useEffect`）に`refreshDropdownSettingsFromDB()`を呼び出す
   - `localStorage`の設定が古い場合（10分以上経過）は自動的にDBから取得する仕組みは既に`refreshDropdownSettingsFromDB()`内に実装されている
   - 既存の`getDropdownOptions()`の動作は維持（localStorage優先）

2. **実装対象**:
   - `LeadDetailPanel.tsx`: `openingPeriod`を使用しているため
   - `calls/page.tsx`: `staffIS`を使用しているため
   - `CallDetailPanel.tsx`: 多数の設定を使用しているため
   - `deals/page.tsx`: `dealStaffFS`を使用しているため
   - `DealDetailPanel.tsx`: 多数の設定を使用しているため
   - `ContractDetailPanel.tsx`: `contractStaff`を使用しているため

3. **実装方法**:
   ```typescript
   useEffect(() => {
     // 初回読み込み時にDBから設定を取得（既存のlocalStorage設定を上書きしない）
     refreshDropdownSettingsFromDB().catch(err => {
       console.error('Failed to refresh dropdown settings:', err)
       // エラー時は既存のlocalStorage設定を使用（既存動作を維持）
     })
   }, [])
   ```

**影響範囲**:
- 各ページ/コンポーネントの`useEffect`にDB同期処理を追加
- 既存の`getDropdownOptions()`の動作は変更しない（localStorage優先のまま）

**注意事項**:
- `refreshDropdownSettingsFromDB()`は既に10分以内の更新は無視する仕組みがあるため、頻繁なDBアクセスは発生しない
- エラー時は既存のlocalStorage設定を使用するため、既存動作を維持

---

#### 1.2 カテゴリ名の統一

**現状**:
- 設定メニューのセクションID: `dealManagement`
- DBのカテゴリ名: `deal`
- `categoryMap`で`dealManagement` → `deal`に変換されている

**修正方針**: **マッピングを明確化し、コメントで明記（既存のDBデータとの互換性を保つ）**

**修正内容**:

1. **`settings/page.tsx`の`categoryMap`にコメントを追加**:
   ```typescript
   // カテゴリマッピング: 設定メニューのセクションID → DBカテゴリ名
   // 注意: 既存のDBデータとの互換性のため、このマッピングを維持
   const categoryMap: Record<string, string> = {
     'call': 'call',           // 架電管理: セクションIDとDBカテゴリが一致
     'dealManagement': 'deal', // 商談管理: セクションIDは`dealManagement`だが、DBカテゴリは`deal`
   }
   ```

2. **`refreshDropdownSettingsFromDB()`のコメントを追加**:
   - DBから取得した設定をカテゴリ別にマージする処理にコメントを追加
   - カテゴリ名の不一致について説明を追加

**影響範囲**:
- `settings/page.tsx`: コメント追加のみ（既存の動作は変更しない）
- `dropdownSettings.ts`: コメント追加のみ（既存の動作は変更しない）

**注意事項**:
- 既存のDBデータとの互換性のため、カテゴリ名の変更は行わない
- マッピングを明確化することで、将来の混乱を防ぐ

---

### 🟡 優先度2: 部分的不整合の修正（ドキュメント化）

#### 2.1 カテゴリ境界の明確化

**現状**:
- 複数のページで使用される設定が特定のカテゴリに属している
- カテゴリ名だけでは使用箇所が判断できない

**修正方針**: **ドキュメント化（既存の実装は変更しない）**

**修正内容**:
- 整合性調査レポートに「カテゴリ境界の説明」セクションを追加
- 各設定キーの使用箇所を明記

**影響範囲**:
- ドキュメントのみ（既存の実装は変更しない）

---

#### 2.2 型定義との不一致

**現状**:
- DBに存在するが`DropdownSettings`型に存在しないキーが無視される
- 警告は出るが無視される

**修正方針**: **既存の動作を維持しつつ、警告を改善**

**修正内容**:
- `settings/page.tsx`の警告処理を改善（削除済みフィールドの除外リストを拡張）
- 型定義に存在しないキーが見つかった場合のログを改善

**影響範囲**:
- `settings/page.tsx`: 警告処理の改善のみ（既存の動作は変更しない）

---

## 修正ファイル一覧

### 修正が必要なファイル

1. **`frontend/src/components/leads/LeadDetailPanel.tsx`**
   - DB同期処理を追加（`useEffect`で`refreshDropdownSettingsFromDB()`を呼び出す）

2. **`frontend/src/app/(auth)/calls/page.tsx`**
   - DB同期処理を追加（既に`refreshDropdownSettingsFromDB`はインポートされているが、使用されていない）

3. **`frontend/src/components/calls/CallDetailPanel.tsx`**
   - DB同期処理を追加

4. **`frontend/src/app/(auth)/deals/page.tsx`**
   - DB同期処理を追加（既に`refreshDropdownSettingsFromDB`はインポートされているが、使用されていない）

5. **`frontend/src/components/deals/DealDetailPanel.tsx`**
   - DB同期処理を追加

6. **`frontend/src/components/contracts/ContractDetailPanel.tsx`**
   - DB同期処理を追加

7. **`frontend/src/app/(auth)/settings/page.tsx`**
   - カテゴリマッピングにコメントを追加

8. **`frontend/src/lib/dropdownSettings.ts`**
   - `refreshDropdownSettingsFromDB()`にコメントを追加

---

## 実装順序

### Phase 1: DB同期の実装（優先度1）
1. 各ページ/コンポーネントで`refreshDropdownSettingsFromDB()`を呼び出す
2. エラーハンドリングを追加（既存動作を維持）

### Phase 2: カテゴリ名の明確化（優先度1）
1. `settings/page.tsx`の`categoryMap`にコメントを追加
2. `dropdownSettings.ts`にコメントを追加

### Phase 3: ドキュメント化（優先度2）
1. 整合性調査レポートにカテゴリ境界の説明を追加

---

## 注意事項

1. **既存動作の維持**: `getDropdownOptions()`は既存の通りlocalStorage優先の動作を維持
2. **エラーハンドリング**: DB同期が失敗した場合、既存のlocalStorage設定を使用（既存動作を維持）
3. **パフォーマンス**: `refreshDropdownSettingsFromDB()`は既に10分以内の更新は無視する仕組みがあるため、頻繁なDBアクセスは発生しない
4. **後方互換性**: 既存のDBデータやlocalStorageの設定との互換性を保つ

---

**作成者**: AI開発CTO  
**承認待ち**: 修正内容の確認後、実装を開始
