-- ===================================
-- Update status CHECK constraint and migrate data
-- statusフィールドのCHECK制約を更新し、過去データを新しい形式に移行
-- ===================================

-- 1. まず既存のCHECK制約を削除（データ更新前に削除）
ALTER TABLE call_records DROP CONSTRAINT IF EXISTS call_records_status_check;

-- 2. 過去データの読み替え: '03.アポイント獲得済'と'09.アポ獲得'を'商談獲得'に変更
UPDATE call_records
SET status = '商談獲得'
WHERE status IN ('03.アポイント獲得済', '09.アポ獲得');

-- 3. 新しいCHECK制約を追加（'商談獲得'を含む）
ALTER TABLE call_records
  ADD CONSTRAINT call_records_status_check 
  CHECK (status IN ('未架電', '架電中', '商談獲得', '04.アポなし'));

-- 3. 商談獲得データの修正
-- 3-1. result_contact_status='不通'かつcall_count=0 → '通電', call_count=1
UPDATE call_records
SET 
  result_contact_status = '通電',
  call_count = 1
WHERE status_is = '商談獲得'
  AND result_contact_status = '不通'
  AND (call_count = 0 OR call_count IS NULL);

-- 3-2. call_count=0 → call_count=1（上記以外）
UPDATE call_records
SET call_count = 1
WHERE status_is = '商談獲得'
  AND (call_count = 0 OR call_count IS NULL)
  AND result_contact_status != '不通';

-- 3-3. 商談獲得の全レコードにended_atとtoday_call_statusを設定
UPDATE call_records
SET 
  ended_at = COALESCE(ended_at, updated_at, NOW()),
  today_call_status = COALESCE(today_call_status, '済')
WHERE status_is = '商談獲得'
  AND (ended_at IS NULL OR today_call_status IS NULL OR today_call_status != '済');

-- 4. result_contact_statusの統一: '未通'と'未通電'を'不通'に変更
UPDATE call_records
SET result_contact_status = '不通'
WHERE result_contact_status IN ('未通', '未通電');

-- コメント追加
COMMENT ON COLUMN call_records.status IS '架電進捗状態: 未架電=未作業, 架電中=作業中, 商談獲得=商談獲得済み（終了状態）, 04.アポなし=アポなし（終了状態）';
COMMENT ON COLUMN call_records.status_is IS 'リード全体のISステータス（当日に限らない）: 設定メニューで管理';
COMMENT ON COLUMN call_records.today_call_status IS 'その日の架電完了状態: 済=完了, 未了=未完了, null=未設定';
COMMENT ON COLUMN call_records.call_status_today IS 'その日の具体的な架電結果（複数回架電に対応）: 通電, 不通, 不通1, 不通2, ...';
COMMENT ON COLUMN call_records.result_contact_status IS '直近架電結果（設定メニューで管理）: 未架電, 不通, 通電';
