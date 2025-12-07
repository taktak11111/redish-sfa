# REDISH SFA システム

## 概要

REDISH株式会社の営業支援システム（SFA: Sales Force Automation）のWebアプリケーション化プロジェクト。

## プロジェクト構成

```
REDISH_SFA/
├── README.md                 # このファイル
├── docs/                     # ドキュメント
│   └── SFA_Webアプリ化_企画書・要件定義書.md
├── frontend/                 # Next.js Webアプリケーション（開発予定）
└── gas-backup/              # 既存GASコードのバックアップ
```

## 技術スタック（予定）

- **フロントエンド**: Next.js 14 + React 18 + TypeScript
- **UI**: TailwindCSS + shadcn/ui
- **認証**: NextAuth.js + Google OAuth
- **データストア**: Google Spreadsheet（既存資産活用）
- **API**: Google Sheets API v4

## 開発予定期間

約16週間（4ヶ月）

## ドキュメント

- [企画書・要件定義書](./docs/SFA_Webアプリ化_企画書・要件定義書.md)

## 関連リソース

- 既存SFAスプレッドシート（社内）
- 外部連携スプレッドシート（顧客リード/TR、契約データ）
