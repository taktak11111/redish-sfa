# 技術設計書 (Technical Design Document)

> **注記**: 本specはcc-sdd導入前に実装完了した機能の後付けドキュメントです。

## 概要
商談管理機能のフロントエンド・API実装。

## 実装ファイル
| ファイル | 役割 |
|----------|------|
| `frontend/src/app/(auth)/deals/page.tsx` | 商談一覧ページ |
| `frontend/src/components/deals/DealDetailPanel.tsx` | 商談詳細パネル |
| `frontend/src/app/api/deals/route.ts` | 商談API |

## データベース
- `deals`: 商談データ
