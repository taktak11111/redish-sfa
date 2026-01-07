-- ===================================
-- REDISH SFA Database Schema
-- Version: 1.0.0
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
  duration INTEGER,
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Deals (商談管理)
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id TEXT UNIQUE NOT NULL,
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

-- 5. Dropdown Settings (設定)
CREATE TABLE IF NOT EXISTS dropdown_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, key)
);

-- ===================================
-- インデックス作成
-- ===================================
CREATE INDEX IF NOT EXISTS idx_call_records_lead_id ON call_records(lead_id);
CREATE INDEX IF NOT EXISTS idx_call_records_status ON call_records(status);
CREATE INDEX IF NOT EXISTS idx_call_records_staff_is ON call_records(staff_is);
CREATE INDEX IF NOT EXISTS idx_call_history_call_record_id ON call_history(call_record_id);
CREATE INDEX IF NOT EXISTS idx_deals_deal_id ON deals(deal_id);
CREATE INDEX IF NOT EXISTS idx_deals_lead_id ON deals(lead_id);
CREATE INDEX IF NOT EXISTS idx_deals_result ON deals(result);
CREATE INDEX IF NOT EXISTS idx_deals_staff_is ON deals(staff_is);

-- ===================================
-- RLS (Row Level Security) 有効化
-- ===================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE dropdown_settings ENABLE ROW LEVEL SECURITY;

-- ===================================
-- RLS ポリシー（認証済みユーザーは全データにアクセス可能）
-- ===================================

-- Users ポリシー
CREATE POLICY "Users can view all users" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert users" ON users FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update users" ON users FOR UPDATE TO authenticated USING (true);

-- Call Records ポリシー
CREATE POLICY "Authenticated users can view call_records" ON call_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert call_records" ON call_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update call_records" ON call_records FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete call_records" ON call_records FOR DELETE TO authenticated USING (true);

-- 開発用: 匿名ユーザーもアクセス可能（本番では削除）
CREATE POLICY "Anon users can view call_records" ON call_records FOR SELECT TO anon USING (true);
CREATE POLICY "Anon users can insert call_records" ON call_records FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon users can update call_records" ON call_records FOR UPDATE TO anon USING (true);
CREATE POLICY "Anon users can delete call_records" ON call_records FOR DELETE TO anon USING (true);

-- Call History ポリシー
CREATE POLICY "Authenticated users can view call_history" ON call_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert call_history" ON call_history FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update call_history" ON call_history FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete call_history" ON call_history FOR DELETE TO authenticated USING (true);

-- 開発用: 匿名ユーザーもアクセス可能
CREATE POLICY "Anon users can view call_history" ON call_history FOR SELECT TO anon USING (true);
CREATE POLICY "Anon users can insert call_history" ON call_history FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon users can update call_history" ON call_history FOR UPDATE TO anon USING (true);
CREATE POLICY "Anon users can delete call_history" ON call_history FOR DELETE TO anon USING (true);

-- Deals ポリシー
CREATE POLICY "Authenticated users can view deals" ON deals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert deals" ON deals FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update deals" ON deals FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete deals" ON deals FOR DELETE TO authenticated USING (true);

-- 開発用: 匿名ユーザーもアクセス可能
CREATE POLICY "Anon users can view deals" ON deals FOR SELECT TO anon USING (true);
CREATE POLICY "Anon users can insert deals" ON deals FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon users can update deals" ON deals FOR UPDATE TO anon USING (true);
CREATE POLICY "Anon users can delete deals" ON deals FOR DELETE TO anon USING (true);

-- Dropdown Settings ポリシー
CREATE POLICY "Authenticated users can view dropdown_settings" ON dropdown_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert dropdown_settings" ON dropdown_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update dropdown_settings" ON dropdown_settings FOR UPDATE TO authenticated USING (true);

-- 開発用: 匿名ユーザーもアクセス可能
CREATE POLICY "Anon users can view dropdown_settings" ON dropdown_settings FOR SELECT TO anon USING (true);
CREATE POLICY "Anon users can insert dropdown_settings" ON dropdown_settings FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon users can update dropdown_settings" ON dropdown_settings FOR UPDATE TO anon USING (true);

-- ===================================
-- updated_at 自動更新トリガー
-- ===================================
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

-- ===================================
-- テストデータ投入
-- ===================================
INSERT INTO call_records (lead_id, lead_source, company_name, contact_name, phone, status, linked_date, industry) VALUES
  ('MT0001', 'Meetsmore', '株式会社サンプルA', '山田太郎', '03-1234-5678', '未架電', '2024-01-15', '飲食'),
  ('TP0002', 'TEMPOS', '有限会社テスト', '鈴木花子', '06-9876-5432', '架電中', '2024-01-14', '小売'),
  ('OM0003', 'OMC', 'カフェ開業準備室', '佐藤次郎', '052-111-2222', '03.アポイント獲得済', '2024-01-13', '飲食'),
  ('AM0004', 'Amazon', 'ECショップ田中', '田中三郎', '03-3333-4444', '未架電', '2024-01-12', 'EC'),
  ('MK0005', 'Makuake', 'クラファン佐々木', '佐々木四郎', '06-5555-6666', '架電中', '2024-01-11', '製造')
ON CONFLICT (lead_id) DO NOTHING;

INSERT INTO deals (deal_id, lead_id, lead_source, company_name, contact_name, phone, service, category, rank, staff_is, linked_date) VALUES
  ('SA0001', 'MT0001', 'Meetsmore', '株式会社サンプルA', '山田太郎', '03-1234-5678', 'RO:開業（融資）', 'A:飲食', 'A:80%', '担当者A', '2024-01-15'),
  ('SA0002', 'TP0002', 'TEMPOS', '有限会社テスト', '鈴木花子', '06-9876-5432', 'RT:税務', 'B:非飲食', 'B:50%', '担当者B', '2024-01-14'),
  ('SA0003', 'OM0003', 'OMC', 'カフェ開業準備室', '佐藤次郎', '052-111-2222', 'RO:開業（融資）', 'A:飲食', 'A:80%', '担当者A', '2024-01-13')
ON CONFLICT (deal_id) DO NOTHING;

-- SA0003を成約に更新
UPDATE deals SET result = '01.成約（契約締結）', result_date = '2024-02-01' WHERE deal_id = 'SA0003';

-- 確認用クエリ
SELECT 'call_records' as table_name, COUNT(*) as count FROM call_records
UNION ALL
SELECT 'deals' as table_name, COUNT(*) as count FROM deals;







