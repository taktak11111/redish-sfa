-- ===================================
-- REDISH SFA: 架電オペレーション（目標/タイマー/KPI）履歴保存
-- Version: 12.0.0
-- 目的:
-- - 目標（架電数/商談獲得数/稼働予定時間）の履歴をDBに保存
-- - タイマー（開始/中断/終了）およびKPIカードの値をDBに保存し、ギャップ分析を可能にする
-- ===================================

-- 1) 目標（履歴）
CREATE TABLE IF NOT EXISTS call_ops_targets_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_date DATE NOT NULL,
  actor_email TEXT NOT NULL,
  actor_name TEXT,
  goal_call_count INTEGER,
  goal_deal_count INTEGER,
  planned_work_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_call_ops_targets_history_date_email
  ON call_ops_targets_history (target_date, actor_email, created_at DESC);

-- 2) タイマーイベント（履歴）
CREATE TABLE IF NOT EXISTS call_ops_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  session_date DATE NOT NULL,
  actor_email TEXT NOT NULL,
  actor_name TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('start', 'pause', 'resume', 'end')),
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  payload JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_call_ops_events_session
  ON call_ops_events (session_id, occurred_at);

CREATE INDEX IF NOT EXISTS idx_call_ops_events_date_email
  ON call_ops_events (session_date, actor_email, occurred_at DESC);

-- 3) セッションサマリ（履歴）
CREATE TABLE IF NOT EXISTS call_ops_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  session_date DATE NOT NULL,
  actor_email TEXT NOT NULL,
  actor_name TEXT,

  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  total_ms INTEGER,
  pause_ms INTEGER,
  work_ms INTEGER,

  goal_call_count INTEGER,
  goal_deal_count INTEGER,
  planned_work_minutes INTEGER,

  kpi_call_count INTEGER,
  kpi_connected_count INTEGER,
  kpi_appointment_count INTEGER,
  kpi_calls_per_hour_non_connected NUMERIC,
  kpi_avg_connected_seconds INTEGER,
  kpi_connected_appointment_rate NUMERIC,

  filters JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_call_ops_sessions_date_email
  ON call_ops_sessions (session_date, actor_email, created_at DESC);

-- 4) RLS（anonアクセス遮断）
ALTER TABLE call_ops_targets_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_ops_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_ops_sessions ENABLE ROW LEVEL SECURITY;

