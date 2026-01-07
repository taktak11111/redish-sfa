# プロジェクト構造

## 構成の思想

Next.js App Routerの規約に基づきつつ、ドメイン（Calls, Deals, Contracts等）ごとにコンポーネントを分割する「機能別レイアウト（Feature-based Layout）」を採用。

## ディレクトリパターン

### App Router (ページ)
**場所**: `src/app/`  
**役割**: ルーティングとページ定義。`(auth)` グループで認証必須ページを保護。  
**例**: `src/app/(auth)/leads/page.tsx`

### API Routes (API)
**場所**: `src/app/api/`  
**役割**: サーバーサイドの処理（Google Sheets API連携等）を行うエンドポイント。  
**例**: `src/app/api/calls/route.ts`

### Components (コンポーネント)
**場所**: `src/components/`  
**役割**: 再利用可能なUIパーツ。ドメインごとにディレクトリを分割。  
**例**: `src/components/deals/DealDetailPanel.tsx`

### Libraries (ライブラリ)
**場所**: `src/lib/`  
**役割**: 外部APIクライアント、認証オプション、共通ユーティリティ。  
**例**: `src/lib/supabase/client.ts`

## 命名規則

- **ファイル名**: 原則 `kebab-case`。ただしReactコンポーネントファイルは `PascalCase` を許容。
- **コンポーネント名**: `PascalCase` (例: `CallDetailPanel`)
- **関数名**: `camelCase` (例: `fetchSheetData`)

## インポート順序・ルール

```typescript
// 外部ライブラリ
import { useState } from 'react'
// エイリアスを使用した絶対パス
import { Button } from '@/components/ui/button'
// 相対パス（近接するファイルのみ）
import { localHelper } from './utils'
```

**パスエイリアス**:
- `@/*`: `src/*`

## コード構成の原則

- **関心の分離**: UI (Components)、ロジック (Hooks/Lib)、データ (API/Sheets) を明確に分ける。
- **Single Source of Truth**: 状態管理はTanStack Queryを使用し、サーバーデータとの同期を維持。

---
_Document patterns, not file trees. New files following patterns shouldn't require updates_
