-- ===================================
-- Add source_specific_data JSONB column
-- リードソース別情報をJSONBで保存する方式に移行
-- ===================================

-- call_recordsテーブルにsource_specific_dataカラムを追加
ALTER TABLE call_records 
  ADD COLUMN IF NOT EXISTS source_specific_data JSONB DEFAULT '{}'::jsonb;

-- dealsテーブルにもsource_specific_dataカラムを追加（商談管理でも使用）
ALTER TABLE deals 
  ADD COLUMN IF NOT EXISTS source_specific_data JSONB DEFAULT '{}'::jsonb;

-- 既存データの移行: OMC
UPDATE call_records 
SET source_specific_data = jsonb_build_object(
  'additional_info1', COALESCE(omc_additional_info1, ''),
  'self_funds', COALESCE(omc_self_funds, ''),
  'property_status', COALESCE(omc_property_status, '')
)
WHERE lead_source = 'OMC' 
  AND (omc_additional_info1 IS NOT NULL 
    OR omc_self_funds IS NOT NULL 
    OR omc_property_status IS NOT NULL)
  AND (source_specific_data IS NULL OR source_specific_data = '{}'::jsonb);

-- 既存データの移行: TEMPOS（OMCと同じ構造）
UPDATE call_records 
SET source_specific_data = jsonb_build_object(
  'additional_info1', COALESCE(omc_additional_info1, ''),
  'self_funds', COALESCE(omc_self_funds, ''),
  'property_status', COALESCE(omc_property_status, '')
)
WHERE lead_source = 'TEMPOS' 
  AND (omc_additional_info1 IS NOT NULL 
    OR omc_self_funds IS NOT NULL 
    OR omc_property_status IS NOT NULL)
  AND (source_specific_data IS NULL OR source_specific_data = '{}'::jsonb);

-- dealsテーブルの既存データも移行: OMC
UPDATE deals 
SET source_specific_data = jsonb_build_object(
  'additional_info1', COALESCE(omc_additional_info1, ''),
  'self_funds', COALESCE(omc_self_funds, ''),
  'property_status', COALESCE(omc_property_status, '')
)
WHERE lead_source = 'OMC' 
  AND (omc_additional_info1 IS NOT NULL 
    OR omc_self_funds IS NOT NULL 
    OR omc_property_status IS NOT NULL)
  AND (source_specific_data IS NULL OR source_specific_data = '{}'::jsonb);

-- dealsテーブルの既存データも移行: TEMPOS
UPDATE deals 
SET source_specific_data = jsonb_build_object(
  'additional_info1', COALESCE(omc_additional_info1, ''),
  'self_funds', COALESCE(omc_self_funds, ''),
  'property_status', COALESCE(omc_property_status, '')
)
WHERE lead_source = 'TEMPOS' 
  AND (omc_additional_info1 IS NOT NULL 
    OR omc_self_funds IS NOT NULL 
    OR omc_property_status IS NOT NULL)
  AND (source_specific_data IS NULL OR source_specific_data = '{}'::jsonb);

-- JSONB検索用のGINインデックス作成
CREATE INDEX IF NOT EXISTS idx_call_records_source_data_gin 
  ON call_records USING GIN (source_specific_data);

CREATE INDEX IF NOT EXISTS idx_deals_source_data_gin 
  ON deals USING GIN (source_specific_data);

-- 注意: 既存のomc_*カラムは後方互換性のため残します
-- 将来的に全データ移行が完了したら、以下のコマンドで削除可能:
-- ALTER TABLE call_records DROP COLUMN omc_additional_info1, DROP COLUMN omc_self_funds, DROP COLUMN omc_property_status;
-- ALTER TABLE deals DROP COLUMN omc_additional_info1, DROP COLUMN omc_self_funds, DROP COLUMN omc_property_status;
