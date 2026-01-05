# 技術設計書 (Technical Design Document)

> **注記**: 本specはcc-sdd導入前に実装完了した機能の後付けドキュメントです。

## 概要
架電管理機能のフロントエンド・API実装。

## 実装ファイル
| ファイル | 役割 |
|----------|------|
| `frontend/src/app/(auth)/calls/page.tsx` | 架電一覧ページ |
| `frontend/src/components/calls/CallDetailPanel.tsx` | 架電詳細パネル |
| `frontend/src/components/calls/CallHistoryModal.tsx` | 架電履歴モーダル |
| `frontend/src/app/api/calls/route.ts` | 架電API |
| `frontend/src/app/api/call-history/route.ts` | 架電履歴API |

## データベース
- `call_records`: 架電対象リード
- `call_history`: 架電履歴
