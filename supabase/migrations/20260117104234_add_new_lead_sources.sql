-- 新しいリードソースを追加するためにCHECK制約を更新
ALTER TABLE call_records DROP CONSTRAINT IF EXISTS call_records_lead_source_check;

ALTER TABLE call_records 
ADD CONSTRAINT call_records_lead_source_check 
CHECK (lead_source IN ('Meetsmore', 'TEMPOS', 'OMC', 'Amazon', 'Makuake', 'REDISH', 'USEN', 'freee', 'HOCT SYSTEM', 'S.H.N'));

-- dealsテーブルも同様に更新
ALTER TABLE deals DROP CONSTRAINT IF EXISTS deals_lead_source_check;

ALTER TABLE deals 
ADD CONSTRAINT deals_lead_source_check 
CHECK (lead_source IN ('Meetsmore', 'TEMPOS', 'OMC', 'Amazon', 'Makuake', 'REDISH', 'USEN', 'freee', 'HOCT SYSTEM', 'S.H.N'));
