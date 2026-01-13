# REDISH SFA システム 開発コントロールファイル

> Obsidian（docsジャンクション）から参照できるように、同内容のミラーを `docs/PROJECT_CONTROL.md` にも配置しています。
> 更新する場合は、原則としてプロジェクト直下の本ファイルを更新し、ミラーも同じ内容に保ってください。

**最終更新日**: 2025年12月19日  
**バージョン**: 1.0  
**目的**: システム開発の過程、各チャットでの作業状況、関連ファイル、更新内容を一元管理

---

## 📋 目次

1. [プロジェクト概要](#プロジェクト概要)
2. [カテゴリ別サマリー（機能と工程）](#カテゴリ別サマリー機能と工程)
3. [チャット別作業履歴](#チャット別作業履歴)
4. [機能別ファイルマップ](#機能別ファイルマップ)
5. [改訂履歴サマリー](#改訂履歴サマリー)
6. [開発ルール・ガイドライン](#開発ルールガイドライン)
7. [次のステップ・TODO](#次のステップtodo)
8. [重要な注意事項](#重要な注意事項)

---

## プロジェクト概要

### プロジェクト名
REDISH SFA システム（REDISH_SFA）

### プロジェクトの目的
既存Google SpreadsheetベースのSFA（Sales Force Automation）をWebアプリケーションとして再構築。営業活動の効率化、データ可視化、モバイル対応を実現するシステム。

### 主要技術スタック
- **フロントエンド**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **認証**: NextAuth.js + Google OAuth
- **データストア**: Google Spreadsheet（既存資産活用）+ Supabase
- **API**: Google Sheets API v4
- **状態管理**: TanStack Query (React Query)
- **フォーム**: React Hook Form + Zod

### プロジェクト構造
```text
REDISH_SFA/
├── frontend/          (フロントエンドアプリケーション)
│   ├── src/
│   │   ├── app/         (Next.js App Router)
│   │   ├── components/  (Reactコンポーネント)
│   │   ├── lib/         (ユーティリティ関数、Google Sheets API連携)
│   │   └── types/       (TypeScript型定義)
│   └── package.json
├── supabase/          (Supabaseマイグレーション)
│   └── migrations/
├── docs/              (開発ドキュメント)
│   ├── 01_企画書/
│   ├── 02_詳細設計書/
│   ├── 03_実装完了報告/
│   ├── 04_ルール・ガイドライン/
│   ├── 05_デプロイ関連/
│   ├── 09_改善提案・改修履歴/
│   ├── 10_その他/
│   ├── README.md
│   └── PROJECT_CONTROL.md (Obsidian用ミラー)
├── README.md
└── PROJECT_CONTROL.md (正本)
```

### 主要機能
1. **リード管理**: リード一覧・詳細・登録
2. **商談管理**: 商談一覧・詳細・登録・更新
3. **架電管理**: 架電履歴の記録・管理
4. **契約管理**: 契約一覧・詳細・登録
5. **分析機能**: 商談分析、架電分析、フィールド分析、売上分析
6. **学習機能**: 営業スキル向上のための学習コンテンツ

---

## カテゴリ別サマリー（機能と工程）

このセクションは「いま何がどこまで進んでいて、何が未完了か」を、**機能カテゴリ × 工程カテゴリ**で最短把握するための要約です。

### カテゴリ定義

- **機能カテゴリ（上段）**: リード管理 / 商談管理 / 架電管理 / 契約管理 / 分析機能 / 学習機能 / ドキュメント・運用
- **工程カテゴリ（下段）**: 企画 / 設計 / 実装 / 検証 / 運用 / ドキュメント

### サマリー（全Cursorチャット累積）

- **対象範囲**: 各Cursorチャット内での作業のみ（外部チャットは対象外）

#### 現在の状況

- **コア機能**: ✅ 実装完了
  - リード管理、架電管理、商談管理、成約管理が動作中
  - Supabase DBとの連携完了
  
- **セキュリティ**: ✅ 強化完了（2026-01-05）
  - anon RLSポリシー削除（DB層）
  - APIルート認証ガード追加（アプリ層）
  - 開発モードでは認証スキップ、本番では認証必須
  
- **デプロイ**: 🔄 準備中
  - Supabase: セットアップ完了
  - Vercel: 本番デプロイ未実施

### 実装済み機能

| 種別 | 機能カテゴリ | 工程カテゴリ | 内容 | 完了日 | 関連ファイル |
|------|------------|------------|------|--------|------------|
| ✅ 完了 | リード管理 | 実装 | リード管理機能の実装 | 2025-12 | `frontend/src/app/(auth)/leads/` |
| ✅ 完了 | 商談管理 | 実装 | 商談管理機能の実装 | 2025-12 | `frontend/src/app/(auth)/deals/` |
| ✅ 完了 | 架電管理 | 実装 | 架電履歴管理機能の実装 | 2025-12 | `frontend/src/app/(auth)/calls/` |
| ✅ 完了 | 成約管理 | 実装 | 成約管理機能の実装 | 2025-12 | `frontend/src/app/(auth)/contracts/` |
| ✅ 完了 | セキュリティ | 実装 | anon RLSポリシー削除 | 2026-01-05 | `supabase/migrations/002_remove_anon_policies.sql` |
| ✅ 完了 | セキュリティ | 実装 | APIルート認証ガード追加 | 2026-01-05 | `frontend/src/lib/auth/guard.ts` |

### 未完了・要判断

| 種別 | 機能カテゴリ | 工程カテゴリ | 内容 | 次アクション | 関連ファイル |
|------|------------|------------|------|------------|------------|
| ✅ 完了 | 分析機能 | 検証 | SFAデータ整合性検証（SQL対照） | 2026-01-07 | `docs/03_実装完了報告/2026-01-07_SFAデータ整合性検証レポート.md` |
| ⏳ 進行中 | 分析機能 | 実装 | 分析機能の堅牢性強化（NULL対応等） | - | `frontend/src/app/api/analysis/sales/route.ts` |
| 未実施 | 請求システム | 企画 | 請求システム Phase 2 要件定義 | - | - |
| 未実施 | 分析機能 | 実装 | 商談分析（Meet連携）機能実装 | - | `frontend/src/app/(auth)/analysis/deals/page.tsx` |
| 未実施 | ドキュメント・運用 | 検証 | フロントエンド実装後の型チェック・ビルド確認 | - | `frontend/` |
| 未実施 | デプロイ | 運用 | Vercel本番環境デプロイ | 環境変数設定、ドメイン設定 | - |

---

## チャット別作業履歴

### 2025年12月19日 - ドキュメント整理・PROJECT_CONTROL.md作成

**チャット識別子**: ドキュメント整理チャット

#### 実施内容

1. **docsフォルダの整理**
   - 既存のドキュメント構造を確認
   - 開業システムと同様の構造（01-10カテゴリ）への整理方針を決定

2. **README.mdの作成**
   - `docs/README.md` を作成
   - フォルダ構造、カテゴリ別ファイル分類、主要ドキュメント、作業フローを記載

3. **PROJECT_CONTROL.mdの作成**
   - プロジェクト直下に `PROJECT_CONTROL.md` を作成
   - プロジェクト概要、カテゴリ別サマリー、チャット別作業履歴、機能別ファイルマップの構造を整備

#### 変更ファイル
- `docs/README.md` - **新規作成**
- `PROJECT_CONTROL.md` - **新規作成**

#### 関連ドキュメント
- `docs/SFA_Webアプリ化_企画書・要件定義書.md` - 企画書・要件定義書
- `docs/架電履歴管理UI設計案.md` - UI設計案

#### 実装方針
- **開業システムとの整合性**: 開業システムと同様のドキュメント構造を採用
- **段階的整理**: 既存のドキュメント構造を維持しつつ、必要に応じて追加カテゴリを作成

#### 未完了タスク
- 既存ファイルのカテゴリ移動（必要に応じて実施）
- 型チェック・ビルド確認は未実施（必要に応じて実施）

---

## 機能別ファイルマップ

### リード管理

#### コアファイル
- `frontend/src/app/(auth)/leads/page.tsx` - リード一覧

#### 関連ドキュメント
- `docs/SFA_Webアプリ化_企画書・要件定義書.md` - 企画書・要件定義書

---

### 商談管理

#### コアファイル
- `frontend/src/app/(auth)/deals/page.tsx` - 商談一覧
- `frontend/src/components/deals/DealDetailPanel.tsx` - 商談詳細パネル
- `frontend/src/lib/sheets/deals.ts` - 商談データ取得（Google Sheets API）

#### 関連ドキュメント
- `docs/SFA_Webアプリ化_企画書・要件定義書.md` - 企画書・要件定義書

---

### 架電管理

#### コアファイル
- `frontend/src/app/(auth)/calls/page.tsx` - 架電一覧
- `frontend/src/components/calls/CallDetailPanel.tsx` - 架電詳細パネル
- `frontend/src/components/calls/CallHistoryModal.tsx` - 架電履歴モーダル
- `frontend/src/lib/sheets/calls.ts` - 架電データ取得（Google Sheets API）

#### 関連ドキュメント
- `docs/架電履歴管理UI設計案.md` - UI設計案
- `docs/SFA_Webアプリ化_企画書・要件定義書.md` - 企画書・要件定義書

---

### 契約管理

#### コアファイル
- `frontend/src/app/(auth)/contracts/page.tsx` - 契約一覧
- `frontend/src/components/contracts/ContractDetailPanel.tsx` - 契約詳細パネル

#### 関連ドキュメント
- `docs/SFA_Webアプリ化_企画書・要件定義書.md` - 企画書・要件定義書

---

### 分析機能

#### コアファイル
- `frontend/src/app/(auth)/analysis/sales/page.tsx` - 売上分析
- `frontend/src/app/(auth)/analysis/deals/page.tsx` - 商談分析
- `frontend/src/app/(auth)/analysis/calls/page.tsx` - 架電分析
- `frontend/src/app/(auth)/analysis/field/page.tsx` - フィールド分析

#### 関連ドキュメント
- `docs/企画書_商談分析_架電分析システム.md` - 分析システム企画書
- `docs/要件定義書_商談分析_架電分析_学習システム.md` - 分析システム要件定義書

---

### 学習機能

#### コアファイル
- `frontend/src/app/(auth)/learning/page.tsx` - 学習ページ

#### 関連ドキュメント
- `docs/要件定義書_商談分析_架電分析_学習システム.md` - 学習システム要件定義書

---

### Google Sheets API連携

#### コアファイル
- `frontend/src/lib/sheets/client.ts` - Google Sheets API クライアント
- `frontend/src/lib/sheets/index.ts` - Sheets API エクスポート
- `frontend/src/lib/sheets/calls.ts` - 架電データ取得
- `frontend/src/lib/sheets/deals.ts` - 商談データ取得

---

## 改訂履歴サマリー

### 最新の主要変更（2025年12月）

| 日付 | 変更内容 | 重要度 | 関連ファイル |
|------|---------|--------|------------|
| 12/19 | ドキュメント整理・PROJECT_CONTROL.md作成 | 中 | `docs/README.md`, `PROJECT_CONTROL.md` |

---

## 開発ルール・ガイドライン

### 必須参照ドキュメント

| ドキュメント | パス | 内容 |
|-------------|------|------|
| **企画書（UIベースSDD形式）** | `docs/01_企画書/📋 REDISH_SFA企画書_UIベースSDD形式.md` | UIベースSDD開発手法テンプレート準拠 |
| **要件定義書（UIベースSDD形式）** | `docs/02_詳細設計書/📋 REDISH_SFA要件定義書_UIベースSDD形式.md` | UIベースSDD開発手法テンプレート準拠 |
| **企画書・要件定義書（原本）** | `docs/01_企画書/SFA_Webアプリ化_企画書・要件定義書.md` | システム企画、要件定義、機能要件、非機能要件 |
| **開発ルール** | `docs/04_ルール・ガイドライン/開発ルール.md` | 開発ルール、コーディング規約 |
| **デザインシステム** | `docs/04_ルール・ガイドライン/デザインシステム.md` | デザインシステム、UIガイドライン |
| **デプロイガイド** | `docs/05_環境構築・デプロイ/setup_guide_supabase_vercel_github.md` | Supabase、Vercel、GitHubのセットアップガイド |
| **開発パートナーオンボーディング** | `docs/08_引き継ぎ資料/開発パートナー_オンボーディングパック.md` | 外部/協業パートナー向けの最短着手ガイド |

### 開発前チェックリスト

**新機能実装や既存機能修正前に必ず確認：**

- [ ] 企画書・要件定義書を確認した
- [ ] 開発ルールを確認した
- [ ] デザインシステムを確認した
- [ ] 既存のコンポーネントを確認（再利用可能か）
- [ ] **PROJECT_CONTROL.mdを確認した**（関連作業の有無）

---

## 次のステップ・TODO

### 🎯 2026年1月 リリース計画

**リリース日**: 2026年1月15日（β版）

#### Phase 1: SFA集中（1/6-1/10）- 最優先

| 日 | タスク | 成果物 | 状態 |
|:--:|--------|--------|:----:|
| **1/6** | Vercelデプロイ・本番確認 | 本番URL稼働 | ✅ |
| **1/7** | 売上分析・商談分析実装 | 分析2機能 | ⏳ |
| **1/8** | 架電分析・フィールド分析実装 | 分析4機能完了 | - |
| **1/9** | 統合テスト・バグ修正 | 品質担保 | - |
| **1/10** | 最終調整・リリース準備 | **SFA β版Ready** | - |

#### 残タスク一覧

| # | タスク | 優先度 | 状態 |
|:-:|--------|:------:|:----:|
| 1 | Vercel本番デプロイ | P0 | ✅ |
| 2 | 売上分析機能実装 | P0 | - |
| 3 | 商談分析機能実装 | P0 | - |
| 4 | 架電分析機能実装 | P0 | - |
| 5 | フィールド分析機能実装 | P0 | - |
| 6 | 統合テスト | P0 | - |
| 7 | 本番動作確認 | P0 | - |
| 8 | **Google OAuth設定（本番用）** | P1 | ⏳ |
| 9 | **Vercel環境変数 ALLOWED_EMAIL_DOMAINS 設定** | P1 | ⏳ |

### 完了済み作業

- ✅ コア機能実装（リード/商談/架電/成約管理）
- ✅ Supabase DB連携
- ✅ RLS anon削除（セキュリティ強化）
- ✅ APIルート認証ガード
- ✅ **Monorepo構造への移行**（2026-01-13）
  - 共通コンポーネント（DateRangeFilter）を `packages/shared/` に配置
  - npm workspaces設定
  - Vercelデプロイ設定（vercel.json）

### 今後の予定（1/15以降）

1. **運用開始**
   - ユーザーフィードバック収集
   - バグ修正・改善

2. **機能拡張**
   - 学習機能の実装
   - レポート機能の強化

---

## ⚠️ 本番稼働前チェックリスト（必須）

**テストローンチ前に必ず確認すること：**

### セキュリティ
- [x] **anon RLSポリシー削除**（2026-01-05 完了）
  - 実行SQL: `supabase/migrations/002_remove_anon_policies.sql`
  - 確認済み: anonポリシー0件、authenticatedポリシー18件
  - spec: `.kiro/specs/security-anon-rls-removal/`
- [x] **APIルート認証ガード追加**（2026-01-05 完了）
  - 対象: `/api/calls`, `/api/deals`, `/api/call-history`
  - 開発モードでは認証スキップ、本番では401エラー
  - spec: `.kiro/specs/api-route-auth-guard/`

### cc-sdd Spec一覧（Validation完了）

| Spec | Phase | Validation | 備考 |
|------|-------|:----------:|------|
| lead-management | ✅ completed | ✅ pass | 後付けspec |
| call-management | ✅ completed | ✅ pass | 後付けspec |
| deal-management | ✅ completed | ✅ pass | 後付けspec |
| contract-management | ✅ completed | ✅ pass | 後付けspec |
| call-analysis | ✅ completed | ✅ pass | 後付けspec |
| deal-analysis | ✅ completed | ✅ pass | 後付けspec |
| security-anon-rls-removal | ✅ completed | ✅ pass | 新規cc-sdd準拠 |
| api-route-auth-guard | ✅ completed | ✅ pass | 新規cc-sdd準拠 |

### UIベースSDD開発手法適用（2026-01-05）
- [x] 企画書テンプレート適用: `docs/01_企画書/📋 REDISH_SFA企画書_UIベースSDD形式.md`
- [x] 要件定義書テンプレート適用: `docs/02_詳細設計書/📋 REDISH_SFA要件定義書_UIベースSDD形式.md`
- [x] 全機能Validation完了（動作確認済み）

### 認証
- [x] NextAuth.js の認証フロー動作確認
- [ ] **Google OAuth の本番リダイレクトURI追加**
  - Google Cloud Console → APIとサービス → 認証情報 → OAuth 2.0 クライアントID
  - 追加URI: `https://redish-sfa-git-main-redish-1bf9fdac.vercel.app/api/auth/callback/google`
- [ ] **Vercel環境変数 ALLOWED_EMAIL_DOMAINS 設定**
  - Vercel Dashboard → Settings → Environment Variables
  - Key: `ALLOWED_EMAIL_DOMAINS`, Value: `redish.jp`
  - 設定後、Redeployが必要
- [ ] 許可ユーザー（@redish.jp）のみアクセス可能か確認

### データ
- [ ] テストデータの削除/本番データの投入
- [ ] バックアップ設定の確認

---

## 重要な注意事項

### コントロールファイルの更新ルール

**このファイル（PROJECT_CONTROL.md）は、以下のタイミングで必ず更新してください：**

1. **新機能実装時**
   - 「チャット別作業履歴」セクションに作業内容を追加
   - 「機能別ファイルマップ」セクションに関連ファイルを追加
   - 「改訂履歴サマリー」セクションに変更内容を追加

2. **重要な変更時**
   - 既存機能の大幅な変更
   - アーキテクチャの変更
   - 開発ルールの変更

3. **チャット開始時**
   - 新しいチャットで作業を開始する前に、このファイルを確認
   - 関連する過去の作業を把握

4. **チャット終了時**
   - 実施した作業を「チャット別作業履歴」に記録
   - 変更したファイルをリストアップ
   - 関連ドキュメントへのリンクを追加

---

## ⚠️ インシデント準拠記録

### INCIDENT-001: 設定変更が反映されない問題（2026-01-11）

| 項目 | 内容 |
|------|------|
| **発生日時** | 2026-01-11 |
| **影響時間** | 約30分（検証・修正の繰り返し） |
| **カテゴリ** | データマイグレーション設計ミス |
| **影響範囲** | 設定画面 → 架電詳細への設定連動 |

#### 現象
- 設定画面で「失注サブ理由（競合要因）」を5件に変更→保存
- 画面リロード後、設定が6件に戻っている
- 架電詳細のドロップダウンにも反映されない

#### 根本原因
`applyDropdownSettingsMigrations`関数が「6件未満なら補完」という**緩すぎる条件**で設計されていた。

```javascript
// 悪い条件（過剰介入）
if (cleaned.length < desiredValues.length || !hasMemoStyle) {
  // 6件未満なら補完 → ユーザーの意図的な編集も上書き
}

// 正しい条件（移行対象を明示）
if (hasLegacyValues) {
  // 旧値「競合に決定（価格/サービス）」を含む場合のみ変換
}
```

#### 対応
- `frontend/src/lib/dropdownSettings.ts`の`applyDropdownSettingsMigrations`関数を修正
- 「旧値を含む場合のみ」移行処理を実行するように条件を厳格化

#### 学び
| 原則 | 内容 |
|------|------|
| **移行条件は明示的に** | 「〇件未満」ではなく「旧値Xを含む場合」のように、移行対象を特定する |
| **設定の編集を尊重** | マイグレーション後は、ユーザーの編集結果を上書きしない |
| **保存→リロードテスト** | 設定変更の動作確認は「保存→リロード後も維持されるか」まで確認する |

#### 関連ファイル
- `frontend/src/lib/dropdownSettings.ts`
- `frontend/src/app/(auth)/settings/page.tsx`

---

## 更新履歴

| 日付 | 更新内容 | 更新者 |
|------|---------|--------|
| 2025-12-19 | 初版作成（ドキュメント整理・PROJECT_CONTROL.md作成） | - |
| 2026-01-05 | セキュリティ強化完了（anon RLS削除、API認証ガード）、実装済み機能ステータス更新 | - |
| 2026-01-05 | UIベースSDD開発手法テンプレート適用、全spec Validation完了 | - |
| 2026-01-11 | INCIDENT-001記録：設定変更が反映されない問題（マイグレーション設計ミス） | - |

---

**このファイルは、REDISH SFAシステムの開発における「唯一の真実の源（Single Source of Truth）」として機能します。**
**開発者は、このファイルを常に最新の状態に保ち、開発の過程を可視化してください。**





