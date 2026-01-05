# 技術設計書 (Technical Design Document)

> **注記**: 本specはcc-sdd導入前に実装完了した機能の後付けドキュメントです。

## 概要
商談結果分析機能のフロントエンド実装。商談データを集計・可視化し、営業戦略の改善を支援。

## 実装ファイル
| ファイル | 役割 |
|----------|------|
| `frontend/src/app/(auth)/analysis/field/page.tsx` | 商談結果分析ページ |
| `frontend/src/app/(auth)/analysis/deals/page.tsx` | 商談プロセス分析ページ |

## データフロー
```
deals → 集計処理 → グラフ・テーブル表示
```

## 主要指標（KPI）
- 商談件数
- 成約件数・成約率
- 平均商談期間
- パイプライン金額
- 失注理由分析
