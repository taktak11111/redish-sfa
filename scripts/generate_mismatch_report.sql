-- CSVファイルとデータベースの不整合レポートを生成するSQL
-- このSQLを実行して、不整合があるレコードをすべて洗い出します

-- 1. OMCリードで未架電のレコード（OMCリードは必ず架電されているはず）
SELECT 
  'OMC未架電' as mismatch_type,
  lead_id,
  lead_source,
  status,
  status_is,
  call_count,
  result_contact_status,
  staff_is,
  last_called_date,
  updated_at
FROM call_records
WHERE lead_source = 'OMC'
  AND status = '未架電'
ORDER BY lead_id;

-- 2. TEMPOSリードで未架電のレコード（直近7日以外は必ず架電されているはず）
SELECT 
  'TEMPOS未架電（直近7日以外）' as mismatch_type,
  lead_id,
  lead_source,
  status,
  status_is,
  call_count,
  result_contact_status,
  staff_is,
  last_called_date,
  linked_date,
  updated_at
FROM call_records
WHERE lead_source = 'TEMPOS'
  AND status = '未架電'
  AND (linked_date IS NULL OR linked_date < CURRENT_DATE - INTERVAL '7 days')
ORDER BY lead_id;

-- 3. status_isが設定されているのに、statusが未架電のままのレコード
SELECT 
  'status_is不一致' as mismatch_type,
  lead_id,
  lead_source,
  status,
  status_is,
  call_count,
  result_contact_status,
  staff_is,
  last_called_date,
  updated_at
FROM call_records
WHERE status_is IS NOT NULL 
  AND status_is != '未架電'
  AND status = '未架電'
ORDER BY lead_id;

-- 4. result_contact_statusが「通電」なのに、call_countが0またはnullのレコード
SELECT 
  'call_count不一致（通電なのに0）' as mismatch_type,
  lead_id,
  lead_source,
  status,
  status_is,
  call_count,
  result_contact_status,
  staff_is,
  last_called_date,
  updated_at
FROM call_records
WHERE result_contact_status = '通電'
  AND (call_count = 0 OR call_count IS NULL)
ORDER BY lead_id;

-- 5. call_countが0なのに、result_contact_statusが「通電」のレコード
SELECT 
  'result_contact_status不一致（0回なのに通電）' as mismatch_type,
  lead_id,
  lead_source,
  status,
  status_is,
  call_count,
  result_contact_status,
  staff_is,
  last_called_date,
  updated_at
FROM call_records
WHERE call_count = 0
  AND result_contact_status = '通電'
ORDER BY lead_id;
