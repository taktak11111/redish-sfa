# REDISH SFA - Supabase + Vercel 構築ガイド

## 概要

このガイドでは、REDISH SFAアプリケーションを以下の構成でデプロイします：
- **バックエンド**: Supabase（PostgreSQL, 認証, API）
- **フロントエンド**: Vercel（Next.js ホスティング）

---

## Phase 1: Supabase プロジェクトセットアップ

### 1.1 Supabase プロジェクト作成

1. [Supabase](https://supabase.com) にアクセスしてアカウント作成
2. 「New Project」をクリック
3. 以下を設定：
   - Organization: 選択または新規作成
   - Project name: `redish-sfa`
   - Database password: 強力なパスワードを設定（保存しておく）
   - Region: `Northeast Asia (Tokyo)` を選択
4. 「Create new project」をクリック（2-3分待機）

### 1.2 プロジェクト情報を取得

Settings > API から以下を取得：
- **Project URL**: `https://xxxxx.supabase.co`
- **anon public key**: `eyJhbGci...`
- **service_role key**: `eyJhbGci...`（本番環境のみ使用）

---

## Phase 2: データベース設計

### 2.1 SQLエディタでテーブル作成

Supabase Dashboard > SQL Editor で以下を実行：

```sql
-- ===================================
-- REDISH SFA Database Schema
-- ===================================

-- 1. Users テーブル（Supabase Authと連携）
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff')),
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Call Records (架電管理)
CREATE TABLE IF NOT EXISTS call_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id TEXT UNIQUE NOT NULL,
  lead_source TEXT NOT NULL CHECK (lead_source IN ('Meetsmore', 'TEMPOS', 'OMC', 'Amazon', 'Makuake', 'REDISH')),
  linked_date DATE,
  industry TEXT,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_name_kana TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  opening_date TEXT,
  contact_preferred_datetime TEXT,
  alliance_remarks TEXT,
  omc_additional_info1 TEXT,
  omc_self_funds TEXT,
  omc_property_status TEXT,
  amazon_tax_accountant TEXT,
  meetsmore_link TEXT,
  meetsmore_entity_type TEXT,
  makuake_pjt_page TEXT,
  makuake_executor_page TEXT,
  status TEXT NOT NULL DEFAULT '未架電' CHECK (status IN ('未架電', '架電中', '03.アポイント獲得済', '09.アポ獲得', '04.アポなし')),
  staff_is TEXT,
  status_is TEXT,
  status_update_date DATE,
  cannot_contact_reason TEXT,
  recycle_priority TEXT,
  result_contact_status TEXT,
  last_called_date DATE,
  call_count INTEGER DEFAULT 0,
  call_duration TEXT,
  conversation_memo TEXT,
  action_outside_call TEXT,
  next_action_date DATE,
  next_action_content TEXT,
  next_action_supplement TEXT,
  next_action_completed TEXT,
  appointment_date DATE,
  deal_setup_date DATE,
  deal_time TEXT,
  deal_staff_fs TEXT,
  deal_result TEXT,
  lost_reason_fs TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Call History (架電履歴)
CREATE TABLE IF NOT EXISTS call_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_record_id UUID REFERENCES call_records(id) ON DELETE CASCADE,
  call_date DATE NOT NULL,
  call_time TIME,
  staff_is TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('不通', '通話できた', '再架電依頼', 'アポ獲得', '不在', '拒否', 'その他')),
  result TEXT,
  duration INTEGER, -- 秒
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Deals (商談管理)
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id TEXT UNIQUE NOT NULL, -- SA0001形式
  lead_id TEXT REFERENCES call_records(lead_id),
  lead_source TEXT,
  linked_date DATE,
  industry TEXT,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_name_kana TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  opening_date TEXT,
  contact_preferred_datetime TEXT,
  alliance_remarks TEXT,
  omc_additional_info1 TEXT,
  omc_self_funds TEXT,
  omc_property_status TEXT,
  amazon_tax_accountant TEXT,
  meetsmore_link TEXT,
  makuake_link TEXT,
  conversation_memo TEXT,
  service TEXT CHECK (service IN ('RO:開業（融資）', 'RT:税務', 'RA:補助金', 'RB:融資（借り換え）')),
  category TEXT CHECK (category IN ('A:飲食', 'B:非飲食')),
  staff_is TEXT,
  appointment_date DATE,
  deal_setup_date DATE,
  deal_time TEXT,
  deal_staff_fs TEXT,
  deal_execution_date DATE,
  video_link TEXT,
  deal_phase TEXT,
  phase_update_date DATE,
  rank_estimate TEXT,
  rank_change TEXT,
  rank_update_date DATE,
  last_contact_date DATE,
  action_scheduled_date DATE,
  next_action_content TEXT,
  response_deadline DATE,
  action_completed TEXT,
  customer_bant_info TEXT,
  competitor_info TEXT,
  deal_memo TEXT,
  rank TEXT CHECK (rank IN ('A:80%', 'B:50%', 'C:20%', 'D:10%')),
  detail_rank TEXT,
  result TEXT CHECK (result IN ('01.成約（契約締結）', '02.失注（リサイクル対象外）', '03.失注（リサイクル対象）')),
  result_date DATE,
  lost_factor TEXT,
  lost_reason TEXT,
  lost_after_action TEXT,
  feedback_to_is TEXT,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Contracts (成約管理) - dealsのビュー
CREATE VIEW contracts AS
SELECT 
  d.*,
  'CN' || LPAD(ROW_NUMBER() OVER (ORDER BY d.result_date)::TEXT, 4, '0') as contract_id
FROM deals d
WHERE d.result = '01.成約（契約締結）';

-- 6. Dropdown Settings (設定)
CREATE TABLE IF NOT EXISTS dropdown_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, key)
);

-- インデックス作成
CREATE INDEX idx_call_records_lead_id ON call_records(lead_id);
CREATE INDEX idx_call_records_status ON call_records(status);
CREATE INDEX idx_call_records_staff_is ON call_records(staff_is);
CREATE INDEX idx_call_history_call_record_id ON call_history(call_record_id);
CREATE INDEX idx_deals_deal_id ON deals(deal_id);
CREATE INDEX idx_deals_lead_id ON deals(lead_id);
CREATE INDEX idx_deals_result ON deals(result);
CREATE INDEX idx_deals_staff_is ON deals(staff_is);

-- RLS (Row Level Security) 有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE dropdown_settings ENABLE ROW LEVEL SECURITY;

-- RLS ポリシー（認証済みユーザーは全データにアクセス可能）
CREATE POLICY "Users can view all data" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert data" ON users FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update data" ON users FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view call_records" ON call_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert call_records" ON call_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update call_records" ON call_records FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete call_records" ON call_records FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view call_history" ON call_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert call_history" ON call_history FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update call_history" ON call_history FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete call_history" ON call_history FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view deals" ON deals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert deals" ON deals FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update deals" ON deals FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete deals" ON deals FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view dropdown_settings" ON dropdown_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert dropdown_settings" ON dropdown_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update dropdown_settings" ON dropdown_settings FOR UPDATE TO authenticated USING (true);

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_call_records_updated_at
  BEFORE UPDATE ON call_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dropdown_settings_updated_at
  BEFORE UPDATE ON dropdown_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 2.2 初期データ投入（オプション）

```sql
-- テスト用データ
INSERT INTO call_records (lead_id, lead_source, company_name, contact_name, phone, status, linked_date) VALUES
  ('MT0001', 'Meetsmore', '株式会社サンプルA', '山田太郎', '03-1234-5678', '未架電', '2024-01-15'),
  ('TP0002', 'TEMPOS', '有限会社テスト', '鈴木花子', '06-9876-5432', '架電中', '2024-01-14'),
  ('OM0003', 'OMC', 'カフェ開業準備室', '佐藤次郎', '052-111-2222', '03.アポイント獲得済', '2024-01-13');

INSERT INTO deals (deal_id, lead_id, lead_source, company_name, contact_name, phone, service, category, rank, staff_is, linked_date) VALUES
  ('SA0001', 'MT0001', 'Meetsmore', '株式会社サンプルA', '山田太郎', '03-1234-5678', 'RO:開業（融資）', 'A:飲食', 'A:80%', '担当者A', '2024-01-15'),
  ('SA0002', 'TP0002', 'TEMPOS', '有限会社テスト', '鈴木花子', '06-9876-5432', 'RT:税務', 'B:非飲食', 'B:50%', '担当者B', '2024-01-14'),
  ('SA0003', 'OM0003', 'OMC', 'カフェ開業準備室', '佐藤次郎', '052-111-2222', 'RO:開業（融資）', 'A:飲食', 'A:80%', '担当者A', '2024-01-13');

-- SA0003を成約に更新
UPDATE deals SET result = '01.成約（契約締結）', result_date = '2024-02-01' WHERE deal_id = 'SA0003';
```

---

## Phase 3: Supabase 認証設定

### 3.1 Google OAuth 設定

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクト作成
2. 「APIとサービス」>「認証情報」
3. 「認証情報を作成」>「OAuth クライアント ID」
4. アプリケーションの種類: ウェブアプリケーション
5. 承認済みリダイレクト URI に追加:
   - `https://xxxxx.supabase.co/auth/v1/callback`
6. クライアントIDとシークレットを取得

### 3.2 Supabase Auth 設定

1. Supabase Dashboard > Authentication > Providers
2. Google を有効化
3. Client ID と Client Secret を設定
4. URL Configuration で Redirect URLs を確認

---

## Phase 4: Next.js アプリケーション修正

### 4.1 依存パッケージインストール

```bash
cd frontend
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm uninstall next-auth  # NextAuthは不要になる
```

### 4.2 環境変数設定

`.env.local` を作成:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# Vercel用（本番）
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

### 4.3 Supabase クライアント作成

`src/lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

`src/lib/supabase/server.ts`:

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Server Component では無視
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Server Component では無視
          }
        },
      },
    }
  )
}
```

### 4.4 API ルート更新例

`src/app/api/calls/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('call_records')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // カラム名をキャメルケースに変換
  const records = data.map(record => ({
    id: record.id,
    leadId: record.lead_id,
    leadSource: record.lead_source,
    linkedDate: record.linked_date,
    companyName: record.company_name,
    contactName: record.contact_name,
    contactNameKana: record.contact_name_kana,
    phone: record.phone,
    email: record.email,
    status: record.status,
    staffIS: record.staff_is,
    callCount: record.call_count,
    // ... 他のフィールド
  }))

  return NextResponse.json({ data: records })
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  const body = await request.json()
  
  const { data, error } = await supabase
    .from('call_records')
    .insert({
      lead_id: body.leadId,
      lead_source: body.leadSource,
      company_name: body.companyName,
      contact_name: body.contactName,
      phone: body.phone,
      status: body.status || '未架電',
      // ... 他のフィールド
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function PATCH(request: NextRequest) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  const body = await request.json()
  const { leadId, ...updates } = body

  const { data, error } = await supabase
    .from('call_records')
    .update({
      status: updates.status,
      staff_is: updates.staffIS,
      last_called_date: updates.lastCalledDate,
      call_count: updates.callCount,
      // ... 他のフィールド
    })
    .eq('lead_id', leadId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
```

### 4.5 認証ページ更新

`src/app/page.tsx` (ログインページ):

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      console.error('Login error:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">REDISH SFA</h1>
        <button
          onClick={handleGoogleLogin}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Googleでログイン
        </button>
      </div>
    </div>
  )
}
```

`src/app/auth/callback/route.ts`:

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
```

---

## Phase 5: Vercel デプロイ

### 5.1 GitHubリポジトリ準備

```bash
cd REDISH_SFA
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/redish-sfa.git
git push -u origin main
```

### 5.2 Vercel プロジェクト作成

1. [Vercel](https://vercel.com) にログイン
2. 「New Project」をクリック
3. GitHubリポジトリを選択
4. Framework Preset: Next.js
5. Root Directory: `frontend`
6. Environment Variables を設定:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
7. 「Deploy」をクリック

### 5.3 Supabase Redirect URL 更新

Supabase Dashboard > Authentication > URL Configuration:
- Site URL: `https://your-project.vercel.app`
- Redirect URLs に追加: `https://your-project.vercel.app/auth/callback`

---

## Phase 6: 本番環境チェックリスト

### セキュリティ

- [ ] RLS ポリシーが正しく設定されている
- [ ] 環境変数が正しく設定されている
- [ ] service_role key はサーバーサイドのみで使用
- [ ] CORS 設定が正しい

### 機能確認

- [ ] Google ログインが動作する
- [ ] データの取得・作成・更新が動作する
- [ ] 架電管理 → 商談管理の自動移行が動作する

### パフォーマンス

- [ ] インデックスが適切に設定されている
- [ ] 不要なデータフェッチがない

---

## トラブルシューティング

### 「Invalid API key」エラー

- 環境変数が正しく設定されているか確認
- Vercel でビルド後に環境変数を変更した場合は再デプロイが必要

### RLS エラー

- ユーザーが認証されているか確認
- RLS ポリシーが正しく設定されているか確認

### OAuth リダイレクトエラー

- Supabase の Redirect URLs に Vercel の URL が追加されているか確認
- Google Cloud Console の承認済みリダイレクト URI が正しいか確認

---

## 次のステップ

1. **データ移行**: 既存の Google Sheets データを Supabase に移行
2. **Supabase Edge Functions**: 複雑なビジネスロジックを Edge Functions で実装
3. **Realtime**: Supabase Realtime でリアルタイム同期を実装
4. **Storage**: 添付ファイル機能を Supabase Storage で実装





