# 技術設計書 (Technical Design Document)

> **注記**: 本specはcc-sdd導入前に実装完了した機能の後付けドキュメントです。

## 概要
成約管理機能のフロントエンド実装。商談データの中から成約済みのものをフィルタリングして表示。

## 実装ファイル
| ファイル | 役割 |
|----------|------|
| `frontend/src/app/(auth)/contracts/page.tsx` | 成約一覧ページ |
| `frontend/src/components/contracts/ContractDetailPanel.tsx` | 成約詳細パネル |

## データベース
- `deals` テーブルの `result = '成約'` をフィルタリング
