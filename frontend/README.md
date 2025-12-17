# REDISH SFA

REDISH株式会社の営業支援システム（SFA）Webアプリケーション

## 概要

既存のGoogle SpreadsheetベースのSFAをWebアプリケーション化したものです。
データベースとしてGoogle Spreadsheetを引き続き使用し、フロントエンドをモダンなWebアプリとして再構築しています。

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **UI**: Tailwind CSS
- **認証**: NextAuth.js + Google OAuth
- **データアクセス**: Google Sheets API v4
- **状態管理**: TanStack Query

## セットアップ

### 1. 依存関係のインストール

```bash
cd frontend
npm install
```

### 2. 環境変数の設定

`.env.local.example`をコピーして`.env.local`を作成し、必要な値を設定してください。

```bash
cp .env.local.example .env.local
```

### 3. Google Cloud Platformの設定

1. GCPコンソールで新しいプロジェクトを作成
2. Google Sheets APIを有効化
3. OAuth同意画面を設定
4. OAuth 2.0クライアントIDを作成
5. サービスアカウントを作成し、キーをダウンロード

### 4. スプレッドシートの共有

対象のスプレッドシートをサービスアカウントのメールアドレスに共有（編集者権限）

### 5. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアクセス可能

## プロジェクト構造

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 認証が必要なルート
│   │   ├── dashboard/     # ダッシュボード
│   │   ├── calls/         # 架電管理
│   │   ├── deals/         # 商談管理
│   │   └── contracts/     # 成約管理
│   ├── api/               # API Routes
│   └── page.tsx           # ログインページ
├── components/
│   ├── layout/            # レイアウトコンポーネント
│   └── providers.tsx      # Context Providers
├── lib/
│   ├── auth/              # 認証設定
│   └── sheets/            # Google Sheets API連携
└── types/                 # 型定義
```

## 主な機能

- **架電管理**: リードへの架電状況を管理
- **商談管理**: アポイント獲得後の商談進捗を管理
- **成約管理**: 成約した案件を管理
- **ダッシュボード**: 営業活動の概要表示

## 開発ガイドライン

詳細は以下のドキュメントを参照してください：

- [開発ルール](../docs/開発ルール.md)
- [要件定義書](../docs/SFA_Webアプリ化_企画書・要件定義書.md)







