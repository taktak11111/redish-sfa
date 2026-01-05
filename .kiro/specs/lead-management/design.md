# 技術設計書 (Technical Design Document)

> **注記**: 本specはcc-sdd導入前に実装完了した機能の後付けドキュメントです。

## 概要
リード管理機能のフロントエンド実装。Supabaseをデータソースとし、Next.js App Routerで構築。

## アーキテクチャ

### コンポーネント構成
```
frontend/src/app/(auth)/leads/
├── page.tsx          # リード一覧ページ
└── [id]/
    └── page.tsx      # リード詳細ページ（オプション）

frontend/src/components/leads/
└── LeadDetailPanel.tsx  # リード詳細パネル
```

### データフロー
```
ブラウザ → API Route (/api/calls) → Supabase (call_records)
```

## 実装ファイル
| ファイル | 役割 |
|----------|------|
| `frontend/src/app/(auth)/leads/page.tsx` | リード一覧ページ |
| `frontend/src/app/api/calls/route.ts` | API Route |
| `frontend/src/lib/auth/guard.ts` | 認証ガード |
