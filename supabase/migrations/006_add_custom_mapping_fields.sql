-- ===================================
-- Custom Mapping Fields Table
-- カスタムマッピングフィールドを保存するテーブル
-- ===================================

-- カスタムマッピングフィールドテーブル
CREATE TABLE IF NOT EXISTS custom_mapping_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_key TEXT NOT NULL UNIQUE, -- フィールドキー（例: custom_field_1）
  field_label TEXT NOT NULL, -- 表示名（例: カスタム項目1）
  field_type TEXT NOT NULL DEFAULT 'text' CHECK (field_type IN ('text', 'number', 'date', 'boolean')), -- フィールドタイプ
  description TEXT, -- 説明
  is_active BOOLEAN DEFAULT true, -- 有効/無効
  created_by UUID REFERENCES users(id) ON DELETE SET NULL, -- 作成者
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_custom_mapping_fields_field_key ON custom_mapping_fields(field_key);
CREATE INDEX IF NOT EXISTS idx_custom_mapping_fields_is_active ON custom_mapping_fields(is_active);
CREATE INDEX IF NOT EXISTS idx_custom_mapping_fields_created_by ON custom_mapping_fields(created_by);

-- updated_atを自動更新するトリガー
CREATE OR REPLACE FUNCTION update_custom_mapping_fields_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_custom_mapping_fields_updated_at
  BEFORE UPDATE ON custom_mapping_fields
  FOR EACH ROW
  EXECUTE FUNCTION update_custom_mapping_fields_updated_at();

-- RLS（Row Level Security）ポリシー
ALTER TABLE custom_mapping_fields ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが読み取り可能（認証済みユーザーのみ）
CREATE POLICY "Allow authenticated users to read custom_mapping_fields"
  ON custom_mapping_fields
  FOR SELECT
  TO authenticated
  USING (true);

-- admin/managerのみ作成可能
CREATE POLICY "Allow admin and manager to insert custom_mapping_fields"
  ON custom_mapping_fields
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'manager')
    )
  );

-- admin/managerのみ更新可能
CREATE POLICY "Allow admin and manager to update custom_mapping_fields"
  ON custom_mapping_fields
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'manager')
    )
  );

-- adminのみ削除可能
CREATE POLICY "Allow admin to delete custom_mapping_fields"
  ON custom_mapping_fields
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
