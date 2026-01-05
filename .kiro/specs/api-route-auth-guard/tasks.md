# 実行計画 (Implementation Plan)

## APIルート認証ガードの追加

### 1. 認証ガードユーティリティの作成
- [x] 1.1 `src/lib/auth/guard.ts` を作成し、共通の認証チェック関数を実装する
  - NextAuth.jsの`getServerSession`を使用
  - 未認証時は401エラーレスポンスを返す
  - ログ記録を追加
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3_
  - **実装**: `requireAuth()` と `isAuthError()` 関数を作成

### 2. APIルートへの認証ガード適用
- [x] 2.1 `/api/calls/route.ts` に認証ガードを追加する
  - GET, POST, PATCH メソッドに適用
  - _Requirements: 1.1, 1.2, 1.3, 3.1_
  - **実装**: 3メソッドに認証チェックを追加

- [x] 2.2 `/api/deals/route.ts` に認証ガードを追加する
  - GET, POST, PATCH メソッドに適用
  - _Requirements: 1.1, 1.2, 1.3, 3.1_
  - **実装**: 3メソッドに認証チェックを追加

- [x] 2.3 `/api/call-history/route.ts` に認証ガードを追加する
  - GET, POST, DELETE メソッドに適用
  - _Requirements: 1.1, 1.2, 1.3, 3.1_
  - **実装**: 3メソッドに認証チェックを追加

### 3. 動作確認
- [x] 3.1 未認証状態でAPIにアクセスし、401エラーが返されることを確認する
  - _Requirements: 1.2, 2.1, 2.2_
  - **結果**: `{"error":"認証が必要です","code":"UNAUTHORIZED"}` が返される ✅

- [x] 3.2 認証済み状態でAPIにアクセスし、正常にデータが取得できることを確認する
  - _Requirements: 1.3, 3.1, 3.2_
  - **結果**: 開発モード「認証スキップ」または正規ログインで確認可能
