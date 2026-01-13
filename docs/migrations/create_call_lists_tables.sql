-- 架電リスト機能用テーブル作成（Phase 1）
-- 実行方法: Supabase Dashboard > SQL Editor で実行

-- 1. call_lists テーブル（架電リスト）
CREATE TABLE IF NOT EXISTS call_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  conditions JSONB NOT NULL, -- CallListCondition型のJSON
  lead_ids TEXT[] NOT NULL DEFAULT '{}', -- リードID配列
  staff_is TEXT, -- 担当IS（個人リストモードの場合）
  is_shared BOOLEAN NOT NULL DEFAULT false, -- 共有リストかどうか
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_call_lists_date ON call_lists(date);
CREATE INDEX IF NOT EXISTS idx_call_lists_staff_is ON call_lists(staff_is);
CREATE INDEX IF NOT EXISTS idx_call_lists_is_shared ON call_lists(is_shared);

-- 2. call_list_assignments テーブル（重複防止用）
CREATE TABLE IF NOT EXISTS call_list_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id TEXT NOT NULL,
  call_list_id UUID NOT NULL REFERENCES call_lists(id) ON DELETE CASCADE,
  staff_is TEXT, -- 担当IS
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE, -- 重複防止の判定日（本日単位）
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(lead_id, assigned_date) -- 同一日で重複しないように
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_call_list_assignments_lead_id ON call_list_assignments(lead_id);
CREATE INDEX IF NOT EXISTS idx_call_list_assignments_call_list_id ON call_list_assignments(call_list_id);
CREATE INDEX IF NOT EXISTS idx_call_list_assignments_staff_is ON call_list_assignments(staff_is);
CREATE INDEX IF NOT EXISTS idx_call_list_assignments_assigned_date ON call_list_assignments(assigned_date);
CREATE INDEX IF NOT EXISTS idx_call_list_assignments_assigned_at ON call_list_assignments(assigned_at);

-- コメント追加
COMMENT ON TABLE call_lists IS '架電リスト（Phase 1: 架電リスト機能）';
COMMENT ON TABLE call_list_assignments IS '架電リスト割り当て（重複防止用）';

COMMENT ON COLUMN call_lists.conditions IS '架電リスト作成条件（CallListCondition型のJSON）';
COMMENT ON COLUMN call_lists.lead_ids IS 'リストに含まれるリードID配列';
COMMENT ON COLUMN call_lists.is_shared IS '共有リストかどうか（true: 共有、false: 個人）';
