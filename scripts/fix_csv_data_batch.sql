-- CSVファイルから読み込んだデータに基づいて、不整合があるレコードを一括修正
-- このスクリプトは、CSVファイルのデータを手動で確認しながら実行する

-- 例: OC0301, OC0302, OC0303, OC0304, OC0305, OC0306, OC0307は既に修正済み

-- CSVファイルから読み込んだデータに基づいて、他のレコードも修正
-- パターン1: status_isが設定されているのに、statusが未架電のまま
-- パターン2: result_contact_statusが「通電」なのに、call_countが0またはnull
-- パターン3: call_countが0なのに、result_contact_statusが「通電」

-- まず、不整合があるレコードを確認
SELECT 
  lead_id,
  status,
  status_is,
  call_count,
  result_contact_status,
  call_status_today,
  staff_is,
  last_called_date,
  updated_at
FROM call_records
WHERE 
  (
    -- status_isが設定されているのに、statusが未架電のまま
    status_is IS NOT NULL 
    AND status_is != '未架電'
    AND status = '未架電'
  )
  OR
  (
    -- result_contact_statusが「通電」なのに、call_countが0またはnull
    result_contact_status = '通電'
    AND (call_count = 0 OR call_count IS NULL)
  )
  OR
  (
    -- call_countが0なのに、result_contact_statusが「通電」
    call_count = 0
    AND result_contact_status = '通電'
  )
ORDER BY updated_at DESC
LIMIT 100;
