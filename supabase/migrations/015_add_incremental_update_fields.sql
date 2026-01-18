-- ===================================
-- Add Incremental Update Fields to spreadsheet_configs
-- 差分更新機能のためのフィールド追加
-- ===================================

-- 更新モードと差分更新件数のカラムを追加
ALTER TABLE spreadsheet_configs
  ADD COLUMN IF NOT EXISTS update_mode TEXT DEFAULT 'incremental' CHECK (update_mode IN ('incremental', 'full')),
  ADD COLUMN IF NOT EXISTS incremental_limit INTEGER DEFAULT 100 CHECK (incremental_limit > 0);

-- 既存レコードのデフォルト値を設定
UPDATE spreadsheet_configs
SET 
  update_mode = 'incremental',
  incremental_limit = 100
WHERE update_mode IS NULL OR incremental_limit IS NULL;

-- コメント追加
COMMENT ON COLUMN spreadsheet_configs.update_mode IS '更新モード: incremental=差分更新（最新N件）, full=全件更新';
COMMENT ON COLUMN spreadsheet_configs.incremental_limit IS '差分更新時の処理件数（デフォルト: 100件）';
