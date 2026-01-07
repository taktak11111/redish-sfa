-- ===================================
-- Spreadsheet Configs Table
-- スプレッドシート連携設定を保存するテーブル
-- ===================================

-- スプレッドシート連携設定テーブル
CREATE TABLE IF NOT EXISTS spreadsheet_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- 連携先名（例: TEMPOS, OMC）
  lead_source_prefix TEXT NOT NULL CHECK (LENGTH(lead_source_prefix) = 2), -- リードIDプレフィックス（2文字）
  spreadsheet_id TEXT NOT NULL, -- GoogleスプレッドシートID
  sheet_name TEXT NOT NULL DEFAULT 'Sheet1', -- シート名
  sheet_gid TEXT, -- シートGID（オプション）
  header_row INTEGER NOT NULL DEFAULT 1, -- ヘッダー行（1-indexed）
  column_mappings JSONB NOT NULL DEFAULT '[]'::jsonb, -- カラムマッピング（JSON配列）
  last_imported_at TIMESTAMPTZ, -- 最終インポート日時
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL, -- 作成者（オプション）
  
  -- ユニーク制約：同じスプレッドシートIDとシート名の組み合わせは1つだけ
  UNIQUE(spreadsheet_id, sheet_name)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_spreadsheet_configs_spreadsheet_id ON spreadsheet_configs(spreadsheet_id);
CREATE INDEX IF NOT EXISTS idx_spreadsheet_configs_name ON spreadsheet_configs(name);
CREATE INDEX IF NOT EXISTS idx_spreadsheet_configs_created_at ON spreadsheet_configs(created_at DESC);

-- updated_atを自動更新するトリガー
CREATE OR REPLACE FUNCTION update_spreadsheet_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_spreadsheet_configs_updated_at
  BEFORE UPDATE ON spreadsheet_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_spreadsheet_configs_updated_at();

-- RLS（Row Level Security）ポリシー
ALTER TABLE spreadsheet_configs ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが読み取り可能（認証済みユーザーのみ）
CREATE POLICY "Allow authenticated users to read spreadsheet_configs"
  ON spreadsheet_configs
  FOR SELECT
  TO authenticated
  USING (true);

-- 全ユーザーが作成可能（認証済みユーザーのみ）
CREATE POLICY "Allow authenticated users to insert spreadsheet_configs"
  ON spreadsheet_configs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 全ユーザーが更新可能（認証済みユーザーのみ）
CREATE POLICY "Allow authenticated users to update spreadsheet_configs"
  ON spreadsheet_configs
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 全ユーザーが削除可能（認証済みユーザーのみ）
CREATE POLICY "Allow authenticated users to delete spreadsheet_configs"
  ON spreadsheet_configs
  FOR DELETE
  TO authenticated
  USING (true);

-- サービスロールはすべての操作が可能（定期実行用）
CREATE POLICY "Allow service role full access to spreadsheet_configs"
  ON spreadsheet_configs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
