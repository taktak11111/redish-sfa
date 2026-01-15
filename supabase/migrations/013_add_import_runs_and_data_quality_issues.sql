-- ===================================
-- Add import_runs and data_quality_issues (needs_review)
-- Version: 1.0.0 (MVP)
-- ===================================

-- 1) import_runs: 取り込み実行ログ
CREATE TABLE IF NOT EXISTS import_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spreadsheet_config_id UUID REFERENCES spreadsheet_configs(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'partial', 'failed')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  imported_count INTEGER NOT NULL DEFAULT 0,
  needs_review_count INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_import_runs_started_at ON import_runs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_import_runs_spreadsheet_config_id ON import_runs(spreadsheet_config_id);

-- 2) data_quality_issues: 未登録値（unknown_option）を集約して保持
CREATE TABLE IF NOT EXISTS data_quality_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  issue_type TEXT NOT NULL CHECK (issue_type IN ('unknown_option')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'ignored')),

  setting_key TEXT NOT NULL,
  setting_key_label_ja TEXT NOT NULL,

  observed_value TEXT NOT NULL,
  normalized_value TEXT NOT NULL,

  source TEXT NOT NULL CHECK (source IN ('spreadsheet_import', 'existing_db_scan')),
  source_ref_id UUID,

  sample_table TEXT,
  sample_column TEXT,
  sample_record_ids JSONB NOT NULL DEFAULT '[]'::jsonb,

  count_total INTEGER NOT NULL DEFAULT 0,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolution_note TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(issue_type, setting_key, normalized_value, status)
);

CREATE INDEX IF NOT EXISTS idx_dqi_status_last_seen ON data_quality_issues(status, last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_dqi_setting_key ON data_quality_issues(setting_key);
CREATE INDEX IF NOT EXISTS idx_dqi_source_ref_id ON data_quality_issues(source_ref_id);

-- 3) updated_at 自動更新（data_quality_issues 用）
CREATE OR REPLACE FUNCTION update_data_quality_issues_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_data_quality_issues_updated_at ON data_quality_issues;
CREATE TRIGGER trigger_update_data_quality_issues_updated_at
  BEFORE UPDATE ON data_quality_issues
  FOR EACH ROW
  EXECUTE FUNCTION update_data_quality_issues_updated_at();

-- 4) RLS
ALTER TABLE import_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_quality_issues ENABLE ROW LEVEL SECURITY;

-- 5) Policies（anonは作らない。authenticatedは全操作OK）
DROP POLICY IF EXISTS "Authenticated users can view import_runs" ON import_runs;
DROP POLICY IF EXISTS "Authenticated users can insert import_runs" ON import_runs;
DROP POLICY IF EXISTS "Authenticated users can update import_runs" ON import_runs;
DROP POLICY IF EXISTS "Authenticated users can delete import_runs" ON import_runs;

CREATE POLICY "Authenticated users can view import_runs" ON import_runs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert import_runs" ON import_runs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update import_runs" ON import_runs FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete import_runs" ON import_runs FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can view data_quality_issues" ON data_quality_issues;
DROP POLICY IF EXISTS "Authenticated users can insert data_quality_issues" ON data_quality_issues;
DROP POLICY IF EXISTS "Authenticated users can update data_quality_issues" ON data_quality_issues;
DROP POLICY IF EXISTS "Authenticated users can delete data_quality_issues" ON data_quality_issues;

CREATE POLICY "Authenticated users can view data_quality_issues" ON data_quality_issues FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert data_quality_issues" ON data_quality_issues FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update data_quality_issues" ON data_quality_issues FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete data_quality_issues" ON data_quality_issues FOR DELETE TO authenticated USING (true);

-- 6) service_role（定期実行・運用バッチ向け）
DROP POLICY IF EXISTS "Allow service role full access to import_runs" ON import_runs;
DROP POLICY IF EXISTS "Allow service role full access to data_quality_issues" ON data_quality_issues;

CREATE POLICY "Allow service role full access to import_runs"
  ON import_runs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to data_quality_issues"
  ON data_quality_issues
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

