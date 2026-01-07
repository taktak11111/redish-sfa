# 実装タスク: 売上・成約分析機能 (Sales & Revenue Analysis)

## 1. 準備 (Preparation)
- [ ] ライブラリのインストール (echarts, date-fns)
- [ ] データベースマイグレーションの実行 (deals に mount カラム追加)

## 2. バックエンド実装 (Backend)
- [ ] API Route の作成 (/api/analysis/sales)
  - [ ] 期間指定によるデータフィルタリングロジック
  - [ ] 成約金額の集計 (SUM)
  - [ ] プロセス転換率 (Funnel) の算出
  - [ ] 担当者別の集計

## 3. フロントエンド実装 (Frontend)
- [ ] SalesAnalysisPage のコンポーネント構成の刷新
- [ ] MetricCards: 主要指標の視覚化
- [ ] RevenueTrendChart: Recharts による推移表示
- [ ] SalesFunnelChart: Recharts による漏斗分析表示
- [ ] StaffPerformanceTable: 担当者別テーブルの実装

## 4. テスト・検証 (Testing)
- [ ] テストデータ（金額付き）の投入
- [ ] 集計ロジックの正確性確認
- [ ] モバイル・レスポンシブ対応の確認
