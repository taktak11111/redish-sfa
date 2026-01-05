# 技術設計書 (Technical Design Document)

> **注記**: 本specはcc-sdd導入前に実装完了した機能の後付けドキュメントです。

## 概要
架電結果分析機能のフロントエンド実装。架電データを集計・可視化し、営業活動の改善を支援。

## 実装ファイル
| ファイル | 役割 |
|----------|------|
| `frontend/src/app/(auth)/analysis/sales/page.tsx` | 架電結果分析ページ |
| `frontend/src/app/(auth)/analysis/calls/page.tsx` | 架電プロセス分析ページ |

## データフロー
```
call_records + call_history → 集計処理 → グラフ・テーブル表示
```

## 主要指標（KPI）
- 架電件数
- アポイント獲得数
- アポ率（アポ獲得数 / 架電件数）
- 担当者別パフォーマンス
