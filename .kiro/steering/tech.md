# 技術スタック

## アーキテクチャ

Next.js App Routerを採用したフルスタックWebアプリケーション。認証にはNextAuth.jsを使用し、データストアとしてGoogle Spreadsheet (API) と Supabase (PostgreSQL) を併用するハイブリッド構成。

## 主要技術

- **言語**: TypeScript
- **フレームワーク**: Next.js 14 (App Router)
- **実行環境**: Node.js (LTS推奨)
- **UI**: Tailwind CSS, Lucide React

## 主要ライブラリ

- **状態管理**: TanStack Query (React Query) v5
- **フォーム・バリデーション**: React Hook Form, Zod
- **認証**: NextAuth.js (Google Provider)
- **データベース/バックエンド**: Supabase (supabase-js), Google Sheets API (googleapis)

## 開発標準

### 型安全
- TypeScript strict modeを有効化。
- `any`の使用を原則禁止し、インタフェースや型定義を `src/types/` に集約。

### コード品質
- ESLint (next/core-web-vitals) による静的解析。
- コミット前に `npx tsc --noEmit` による型チェックを推奨。

### テスト
- 今後Vitest等の導入を検討。現在は仕様駆動開発（SDD）によるロジックの分離を優先。

## 開発環境

### 必須ツール
- Node.js 18+
- npm または yarn

### 共通コマンド
```bash
# 開発起動: npm run dev
# ビルド: npm run build
# リント: npm run lint
# 型チェック: npx tsc --noEmit
```

## 主要な技術決定事項

- **Google Sheets API**: 既存のスプレッドシートをマスターデータとして参照・更新するため、`src/lib/sheets/` にクライアントロジックを集約。
- **Supabase**: 永続的なトランザクションデータや、スプレッドシートでは不向きな複雑なリレーションを管理するために採用。

## 共通コンポーネント

### 正本
- `develop/00_CommonDocs/README.md` - 共通コンポーネント一覧と運用ルール

### 実装済みコンポーネント（SFAで使用可能）

| コンポーネント | パス | 用途 |
|---------------|------|------|
| DateRangeFilter | `src/components/shared/DateRangeFilter/` | 期間フィルター（本日/今週/今月/前月/今年度/カスタム） |

### 使用例

```tsx
import { DateRangeFilter, DateRange } from '@/components/shared/DateRangeFilter'

<DateRangeFilter
  defaultPreset="thisMonth"
  presets={['today', 'thisWeek', 'thisMonth', 'lastMonth', 'fiscalYear']}
  showCustomRange={true}
  fiscalYearStart={4}
  onChange={setDateRange}
/>
```

### ルール
1. 新規UI作成時は `00_CommonDocs/README.md` の「実装済み」を確認
2. 該当するコンポーネントがあれば使用を宣言
3. 新規で共通化候補があれば「共通コンポーネント化しますか？」と提案

---
_Document standards and patterns, not every dependency_
