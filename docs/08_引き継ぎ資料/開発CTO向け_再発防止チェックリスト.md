# 開発CTO向け：再発防止チェックリスト

## 📋 概要

本ドキュメントは、開発中に発生したエラーとその解決策を整理し、今後の開発で同様の問題を防ぐためのチェックリストです。

---

## 🔴 重大な問題と再発防止策

### 1. 認証・RLS（Row Level Security）関連

#### 発生した問題
- 開発環境で認証がスキップされているのに、APIルートで`supabase.auth.getUser()`が失敗
- RLSポリシーにより、開発環境でデータが取得できない
- クライアントサイドとサーバーサイドで環境判定が異なる

#### 再発防止策

**✅ 開発環境での認証処理**
```typescript
// ❌ 悪い例：クライアントサイドでprocess.env.NODE_ENVを使用
const isDev = process.env.NODE_ENV === 'development' // ビルド時に固定される

// ✅ 良い例：クライアントサイドではhostnameで判定
const isDevelopment = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
```

**✅ APIルートでのRLSバイパス**
```typescript
// 開発環境ではサービスロールキーを使用
if (process.env.NODE_ENV === 'development') {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (serviceRoleKey) {
    client = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      { auth: { persistSession: false } }
    )
  }
}
```

**✅ チェックリスト**
- [ ] 開発環境では`SUPABASE_SERVICE_ROLE_KEY`を設定しているか
- [ ] クライアントサイドでは`process.env.NODE_ENV`ではなく`window.location.hostname`で判定しているか
- [ ] APIルートでRLSエラーが発生した場合、サービスロールキーを使用しているか

---

### 2. ファイル操作（Write vs search_replace）

#### 発生した問題
- 既存ファイルを`write`ツールで上書きしてしまい、既存の内容が失われた
- リネーム/移動時に`write`+`delete`を使用してしまった

#### 再発防止策

**✅ 既存ファイルの更新**
```typescript
// ❌ 悪い例：writeツールで上書き
write('file.ts', newContent) // 既存内容が失われる

// ✅ 良い例：search_replaceで部分更新
search_replace('file.ts', oldString, newString)
```

**✅ リネーム/移動**
```bash
# ❌ 悪い例：write + delete
write('new-file.ts', content)
delete('old-file.ts')

# ✅ 良い例：git mvを使用
git mv old-file.ts new-file.ts
```

**✅ チェックリスト**
- [ ] 既存ファイルを更新する前に`read_file`で内容を確認したか
- [ ] `write`ツールは新規ファイル作成時のみ使用しているか
- [ ] リネーム/移動は`git mv`を使用しているか
- [ ] 3行以上の削除は事前に承認を得たか

---

### 3. ルーティング・404エラー

#### 発生した問題
- サイドバーのリンクが存在しないパス（`/analysis/calls-process`）を指していた
- Next.jsのルートグループ`(auth)`の理解不足

#### 再発防止策

**✅ ルーティングの確認**
```typescript
// サイドバーのリンクは実際のファイル構造と一致させる
// ファイル: src/app/(auth)/analysis/calls/page.tsx
// URL: /analysis/calls（(auth)はURLに含まれない）
```

**✅ チェックリスト**
- [ ] サイドバーの`href`が実際のファイルパスと一致しているか
- [ ] ルートグループ`(auth)`はURLに含まれないことを理解しているか
- [ ] 新しいページを作成したら、サイドバーのリンクも更新したか

---

### 4. React Hydration Error

#### 発生した問題
- サーバーサイドとクライアントサイドで異なるHTMLが生成された
- `useSession`の`status`が`loading`の状態で条件分岐していた

#### 再発防止策

**✅ クライアントサイドでのみ条件分岐**
```typescript
const [isMounted, setIsMounted] = useState(false)

useEffect(() => {
  setIsMounted(true)
}, [])

// マウント後にのみ条件分岐
if (isMounted && condition) {
  // ...
}
```

**✅ suppressHydrationWarningの使用**
```typescript
<div suppressHydrationWarning>
  {/* サーバーとクライアントで異なる可能性があるコンテンツ */}
</div>
```

**✅ チェックリスト**
- [ ] サーバーとクライアントで異なる値を表示する場合は`isMounted`を使用しているか
- [ ] `useSession`の`status`で条件分岐する場合は、マウント後に実行しているか
- [ ] 日付・時刻など動的な値は`useEffect`内で設定しているか

---

### 5. データベース設計とフロントエンドの不整合

#### 発生した問題
- `dropdown_settings`テーブルが存在するのに、localStorageのみに保存していた
- カラム名がスネークケース（`staff_is`）なのに、フロントエンドでcamelCase（`staffIS`）を使用していた

#### 再発防止策

**✅ データ保存の優先順位**
1. データベース（Supabase）に保存（複数デバイスで共有）
2. localStorageはフォールバックとして使用

**✅ 命名規則の統一**
- DB: スネークケース（`staff_is`, `created_at`）
- TypeScript: camelCase（`staffIs`, `createdAt`）
- 変換が必要な場合はマッピング関数を作成

**✅ チェックリスト**
- [ ] 新しい機能を実装する際、DBに保存するかlocalStorageのみか判断したか
- [ ] DBのカラム名とTypeScriptの型定義が一致しているか
- [ ] マイグレーションファイルを作成したら、TypeScriptの型定義も更新したか

---

### 6. 型安全性の問題

#### 発生した問題
- `next dev`では型チェックが緩いが、`next build`では厳格にチェックされる
- ビルド時に型エラーが発見された

#### 再発防止策

**✅ ビルド前の型チェック**
```bash
# デプロイ前に必ず実行
npx tsc --noEmit
```

**✅ チェックリスト**
- [ ] コード変更後、`npx tsc --noEmit`で型チェックを実行したか
- [ ] 型エラーが0になるまでコミットしない
- [ ] CI/CDパイプラインに型チェックを追加したか

---

### 7. 環境変数の管理

#### 発生した問題
- `SUPABASE_SERVICE_ROLE_KEY`が設定されていない
- 開発環境と本番環境で異なる動作

#### 再発防止策

**✅ 環境変数の確認**
```typescript
// 必須環境変数のチェック
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is not set')
  // フォールバック処理
}
```

**✅ チェックリスト**
- [ ] `.env.local`に必要な環境変数が設定されているか
- [ ] 本番環境（Vercel等）にも環境変数が設定されているか
- [ ] 環境変数の説明を`README.md`に記載したか

---

## 📚 開発フロー改善

### 推奨される開発フロー

1. **実装前**
   - [ ] 既存の類似機能を確認
   - [ ] データベーススキーマを確認
   - [ ] APIエンドポイントの設計を確認

2. **実装中**
   - [ ] 型チェックを実行（`npx tsc --noEmit`）
   - [ ] リンターエラーを確認
   - [ ] ブラウザで動作確認

3. **実装後**
   - [ ] ビルドが成功するか確認（`npm run build`）
   - [ ] 本番環境と同様の動作を確認
   - [ ] ドキュメントを更新

---

## 🔧 デバッグ時の推奨手順

1. **エラーログの確認**
   - ブラウザのコンソール（F12）
   - サーバーのログ（ターミナル）
   - Supabaseのログ（ダッシュボード）

2. **データの確認**
   - Supabaseダッシュボードでテーブルを確認
   - MCPツールでSQLを実行して確認

3. **キャッシュのクリア**
   - `.next`フォルダを削除
   - ブラウザのキャッシュをクリア（Ctrl+Shift+R）

---

## 📝 ドキュメント化の推奨

以下の情報は必ずドキュメント化すること：

- [ ] 新しい機能の実装方法
- [ ] エラーが発生した原因と解決方法
- [ ] 環境変数の設定方法
- [ ] データベーススキーマの変更
- [ ] APIエンドポイントの仕様

---

## 🎯 定期的な確認事項

### 週次確認
- [ ] 型エラーの有無（`npx tsc --noEmit`）
- [ ] リンターエラーの有無（`npm run lint`）
- [ ] ビルドが成功するか（`npm run build`）

### 月次確認
- [ ] 依存関係の更新（`npm outdated`）
- [ ] セキュリティアドバイザーの確認（Supabase）
- [ ] パフォーマンスの確認

---

## 🔗 関連ドキュメント

- [初期管理者ユーザー設定方法](./初期管理者ユーザー設定方法.md)
- [開発環境初期ユーザー作成手順](./開発環境初期ユーザー作成手順.md)
- [.cursorrules](../../../.cursorrules) - 開発ルール
