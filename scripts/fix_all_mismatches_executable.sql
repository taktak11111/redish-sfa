BEGIN;

-- TM3600: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3600' AND status = '未架電';
-- TM3601: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3601' AND status = '未架電';
-- TM3605: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3605' AND status = '未架電';
-- TM3606: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '通電', result_contact_status = '通電', call_count = 5, last_called_date = '2025-05-01', staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3606' AND status = '未架電';
-- TM3607: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 5, last_called_date = '2025-05-01', staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3607' AND status = '未架電';
-- TM3609: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', call_count = 2, last_called_date = '2025-05-01', staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3609' AND status = '未架電';
-- TM3610: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-04-11', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3610' AND status = '未架電';
-- TM3613: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 4, last_called_date = '2025-04-24', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3613' AND status = '未架電';
-- TM3614: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '02.コンタクト試行中', result_contact_status = '不通', call_count = 6, last_called_date = '2026-01-08', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3614' AND status = '未架電';
-- TM3618: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-05-01', staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3618' AND status = '未架電';
-- TM3621: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 4, last_called_date = '2025-04-24', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3621' AND status = '未架電';
-- TM3622: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-09', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3622' AND status = '未架電';
-- TM3624: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', call_count = 2, last_called_date = '2025-05-01', staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3624' AND status = '未架電';
-- TM3625: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 3, last_called_date = '2025-04-11', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3625' AND status = '未架電';
-- TM3630: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-15', staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3630' AND status = '未架電';
-- TM3632: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', last_called_date = '2025-04-15', staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3632' AND status = '未架電';
-- TM3634: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', call_count = 7, last_called_date = '2025-05-01', staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3634' AND status = '未架電';
-- TM3635: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', last_called_date = '2025-04-15', staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3635' AND status = '未架電';
-- TM3637: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3637' AND status = '未架電';
-- TM3638: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3638' AND status = '未架電';
-- TM3640: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', last_called_date = '2025-04-15', staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3640' AND status = '未架電';
-- TM3643: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-24', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3643' AND status = '未架電';
-- TM3645: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '未通', last_called_date = '2025-05-01', staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3645' AND status = '未架電';
-- TM3650: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '未通', last_called_date = '2025-05-01', staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3650' AND status = '未架電';
-- TM3651: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', last_called_date = '2025-05-01', staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3651' AND status = '未架電';
-- TM3653: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', last_called_date = '2025-05-01', staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3653' AND status = '未架電';
-- TM3661: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通電', staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3661' AND status = '未架電';
-- TM3663: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', last_called_date = '2025-05-01', staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3663' AND status = '未架電';
-- TM3665: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', last_called_date = '2025-05-01', staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3665' AND status = '未架電';
-- TM3666: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-24', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3666' AND status = '未架電';
-- TM3679: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-04-24', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3679' AND status = '未架電';
-- TM3684: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '06.ナーチャリング対象', result_contact_status = '通電', call_count = 1, last_called_date = '2026-01-07', staff_is = '金山', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3684' AND status = '未架電';
-- TM3686: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 4, last_called_date = '2025-04-11', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3686' AND status = '未架電';
-- TM3689: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '02.コンタクト試行中', result_contact_status = '不通', call_count = 5, last_called_date = '2026-01-16', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3689' AND status = '未架電';
-- TM3690: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', last_called_date = '2025-05-01', staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3690' AND status = '未架電';
-- TM3691: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-24', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3691' AND status = '未架電';
-- TM3693: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', last_called_date = '2025-05-01', staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3693' AND status = '未架電';
-- TM3697: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '未通', call_count = 5, last_called_date = '2025-04-24', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3697' AND status = '未架電';
-- TM3701: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '未通', last_called_date = '2025-05-01', staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3701' AND status = '未架電';
-- TM3711: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '07.既存顧客', result_contact_status = '未通', last_called_date = '2025-04-15', staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3711' AND status = '未架電';
-- TM3714: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', last_called_date = '2025-05-01', staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3714' AND status = '未架電';
-- TM3732: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '02.コンタクト試行中', result_contact_status = '不通', call_count = 1, last_called_date = '2026-01-16', staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3732' AND status = '未架電';
-- TM3762: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3762' AND status = '未架電';
-- TM3764: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '07.既存顧客', result_contact_status = '未通', last_called_date = '2025-04-18', staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3764' AND status = '未架電';
-- TM3786: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-24', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3786' AND status = '未架電';
-- TM3789: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3789' AND status = '未架電';
-- TM3797: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 4, last_called_date = '2025-12-18', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3797' AND status = '未架電';
-- TM3798: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 4, last_called_date = '2025-12-18', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3798' AND status = '未架電';
-- TM3799: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '不通', call_count = 6, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3799' AND status = '未架電';
-- TM3803: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-10-08', staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3803' AND status = '未架電';
-- TM3815: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '02.コンタクト試行中', result_contact_status = '不通', call_count = 5, last_called_date = '2026-01-16', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3815' AND status = '未架電';
-- TM3817: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-10-08', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3817' AND status = '未架電';
-- TM3820: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '02.コンタクト試行中', result_contact_status = '不通', call_count = 5, last_called_date = '2026-01-16', staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3820' AND status = '未架電';
-- TM3821: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3821' AND status = '未架電';
-- TM3827: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '未通', call_count = 2, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3827' AND status = '未架電';
-- TM3828: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', last_called_date = '2025-04-16', staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3828' AND status = '未架電';
-- TM3829: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '未通', call_count = 3, last_called_date = '2025-12-18', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3829' AND status = '未架電';
-- TM3830: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-10-08', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3830' AND status = '未架電';
-- TM3841: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', last_called_date = '2025-04-18', staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3841' AND status = '未架電';
-- TM3860: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-24', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3860' AND status = '未架電';
-- TM3861: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3861' AND status = '未架電';
-- TM3887: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3887' AND status = '未架電';
-- TM3894: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3894' AND status = '未架電';
-- TM3896: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3896' AND status = '未架電';
-- TM3899: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3899' AND status = '未架電';
-- TM3904: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-24', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3904' AND status = '未架電';
-- TM3908: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 3, last_called_date = '2025-05-20', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3908' AND status = '未架電';
-- TM3910: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3910' AND status = '未架電';
-- TM3932: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3932' AND status = '未架電';
-- TM3944: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3944' AND status = '未架電';
-- TM4079: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 4, last_called_date = '2025-05-20', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4079' AND status = '未架電';
-- TM4086: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4086' AND status = '未架電';
-- TM4092: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4092' AND status = '未架電';
-- TM4100: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4100' AND status = '未架電';
-- TM4101: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4101' AND status = '未架電';
-- TM4121: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4121' AND status = '未架電';
-- TM4122: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', last_called_date = '2025-04-18', staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4122' AND status = '未架電';
-- TM4124: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4124' AND status = '未架電';
-- TM4128: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 3, last_called_date = '2026-01-07', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4128' AND status = '未架電';
-- TM4131: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', last_called_date = '2025-04-18', staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4131' AND status = '未架電';
-- TM4135: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', last_called_date = '2025-04-18', staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4135' AND status = '未架電';
-- TM4137: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '02.コンタクト試行中', result_contact_status = '不通', call_count = 4, last_called_date = '2026-01-16', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4137' AND status = '未架電';
-- TM4141: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4141' AND status = '未架電';
-- TM4142: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', last_called_date = '2025-04-18', staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4142' AND status = '未架電';
-- TM4144: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 3, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4144' AND status = '未架電';
-- TM4147: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4147' AND status = '未架電';
-- TM4151: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4151' AND status = '未架電';
-- TM4157: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4157' AND status = '未架電';
-- TM4158: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4158' AND status = '未架電';
-- TM4164: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', last_called_date = '2025-04-18', staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4164' AND status = '未架電';
-- TM4169: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-24', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4169' AND status = '未架電';
-- TM4170: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2026-01-07', staff_is = '金山', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4170' AND status = '未架電';
-- TM4172: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4172' AND status = '未架電';
-- TM4173: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-18', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4173' AND status = '未架電';
-- TM4174: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4174' AND status = '未架電';
-- TM4184: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4184' AND status = '未架電';
-- TM4186: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4186' AND status = '未架電';
-- TM4187: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4187' AND status = '未架電';
-- TM4188: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-24', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4188' AND status = '未架電';
-- TM4190: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-24', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4190' AND status = '未架電';
-- TM4191: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 3, last_called_date = '2026-01-07', staff_is = '金山', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4191' AND status = '未架電';
-- TM4193: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-24', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4193' AND status = '未架電';
-- TM4194: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4194' AND status = '未架電';
-- TM4198: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4198' AND status = '未架電';
-- TM4200: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-20', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4200' AND status = '未架電';
-- TM4226: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4226' AND status = '未架電';
-- TM4236: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4236' AND status = '未架電';
-- TM4239: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4239' AND status = '未架電';
-- TM4245: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4245' AND status = '未架電';
-- TM4259: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4259' AND status = '未架電';
-- TM4263: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4263' AND status = '未架電';
-- TM4280: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4280' AND status = '未架電';
-- TM4289: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4289' AND status = '未架電';
-- TM4291: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4291' AND status = '未架電';
-- TM4317: CSVに明示的なデータがある（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4317' AND status = '未架電';
-- TM3594: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-01-05）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2026-01-07', staff_is = '金山', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3594' AND status = '未架電';
-- TM3595: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-01-05）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3595' AND status = '未架電';
-- TM3596: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-01-08）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-20', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3596' AND status = '未架電';
-- TM3599: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-01-08）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-20', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3599' AND status = '未架電';
-- TM3604: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-01-09）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3604' AND status = '未架電';
-- TM3612: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-01-09）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-05-20', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3612' AND status = '未架電';
-- TM3620: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-01-11）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3620' AND status = '未架電';
-- TM3627: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-01-15）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-24', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3627' AND status = '未架電';
-- TM3631: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-01-15）
UPDATE call_records SET status_is = '失注', result_contact_status = '未通', call_count = 5, last_called_date = '2025-04-24', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3631' AND status = '未架電';
-- TM3633: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-01-15）
UPDATE call_records SET status_is = '02.コンタクト試行中', result_contact_status = '不通', call_count = 5, last_called_date = '2026-01-16', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3633' AND status = '未架電';
-- TM3636: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-01-15）
UPDATE call_records SET status_is = '02.コンタクト試行中', result_contact_status = '不通', call_count = 2, last_called_date = '2026-01-08', staff_is = '金山', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3636' AND status = '未架電';
-- TM3649: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-01-17）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3649' AND status = '未架電';
-- TM3656: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-01-18）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-24', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3656' AND status = '未架電';
-- TM3669: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-01-23）
UPDATE call_records SET status_is = '失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3669' AND status = '未架電';
-- TM3671: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-01-23）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3671' AND status = '未架電';
-- TM3675: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-01-25）
UPDATE call_records SET status_is = '失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3675' AND status = '未架電';
-- TM3700: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-01-30）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 3, last_called_date = '2026-01-07', staff_is = '金山', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3700' AND status = '未架電';
-- TM3716: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-02-05）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3716' AND status = '未架電';
-- TM3719: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-02-05）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 3, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3719' AND status = '未架電';
-- TM3722: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-02-06）
UPDATE call_records SET status_is = '失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3722' AND status = '未架電';
-- TM3728: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-02-07）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3728' AND status = '未架電';
-- TM3731: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-02-08）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3731' AND status = '未架電';
-- TM3740: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-02-13）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3740' AND status = '未架電';
-- TM3743: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-02-13）
UPDATE call_records SET status_is = '失注', result_contact_status = '不通', call_count = 2, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3743' AND status = '未架電';
-- TM3751: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-02-15）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3751' AND status = '未架電';
-- TM3758: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-02-15）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2026-01-07', staff_is = '金山', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3758' AND status = '未架電';
-- TM3771: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-02-20）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3771' AND status = '未架電';
-- TM3772: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-02-20）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3772' AND status = '未架電';
-- TM3775: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-02-21）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3775' AND status = '未架電';
-- TM3790: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-02-23）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3790' AND status = '未架電';
-- TM3791: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-02-23）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3791' AND status = '未架電';
-- TM3793: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-02-23）
UPDATE call_records SET status_is = '失注', result_contact_status = '未通', call_count = 5, last_called_date = '2025-04-24', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3793' AND status = '未架電';
-- TM3795: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-02-26）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3795' AND status = '未架電';
-- TM3802: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-02-27）
UPDATE call_records SET status_is = '05.対応不可/対象外', result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-20', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3802' AND status = '未架電';
-- TM3805: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-02-28）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-10-08', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3805' AND status = '未架電';
-- TM3810: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-02-29）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3810' AND status = '未架電';
-- TM3816: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-03-04）
UPDATE call_records SET status_is = '失注', result_contact_status = '未架電', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3816' AND status = '未架電';
-- TM3818: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-03-04）
UPDATE call_records SET status_is = '02.コンタクト試行中', result_contact_status = '不通', call_count = 5, last_called_date = '2026-01-16', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3818' AND status = '未架電';
-- TM3819: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-03-05）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-10-08', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3819' AND status = '未架電';
-- TM3822: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-03-06）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3822' AND status = '未架電';
-- TM3823: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-03-06）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 3, last_called_date = '2025-10-08', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3823' AND status = '未架電';
-- TM3825: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-03-07）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3825' AND status = '未架電';
-- TM3835: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-03-12）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3835' AND status = '未架電';
-- TM3836: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-03-12）
UPDATE call_records SET status_is = '06.ナーチャリング対象', result_contact_status = '通電', call_count = 5, last_called_date = '2026-01-08', staff_is = '金山', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3836' AND status = '未架電';
-- TM3838: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-03-12）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3838' AND status = '未架電';
-- TM3839: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-03-12）
UPDATE call_records SET status_is = '06.ナーチャリング対象', result_contact_status = '通電', call_count = 4, last_called_date = '2026-01-08', staff_is = '金山', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3839' AND status = '未架電';
-- TM3840: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-03-12）
UPDATE call_records SET status_is = '02.コンタクト試行中', result_contact_status = '不通', call_count = 5, last_called_date = '2026-01-16', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3840' AND status = '未架電';
-- TM3845: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-03-14）
UPDATE call_records SET status_is = '失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3845' AND status = '未架電';
-- TM3847: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-03-14）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3847' AND status = '未架電';
-- TM3849: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-03-15）
UPDATE call_records SET status_is = '失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3849' AND status = '未架電';
-- TM3852: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-03-18）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3852' AND status = '未架電';
-- TM3853: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-03-18）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3853' AND status = '未架電';
-- TM3854: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-03-18）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3854' AND status = '未架電';
-- TM3855: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-03-18）
UPDATE call_records SET status_is = '失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3855' AND status = '未架電';
-- TM3857: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-03-19）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3857' AND status = '未架電';
-- TM3859: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-03-20）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3859' AND status = '未架電';
-- TM3863: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-03-21）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3863' AND status = '未架電';
-- TM3871: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-03-25）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3871' AND status = '未架電';
-- TM3872: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-03-25）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3872' AND status = '未架電';
-- TM3875: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-03-26）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-23', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3875' AND status = '未架電';
-- TM3877: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-03-26）
UPDATE call_records SET status_is = 'リサイクル対象', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-23', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3877' AND status = '未架電';
-- TM3878: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-03-27）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-23', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3878' AND status = '未架電';
-- TM3882: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-04-01）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-23', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3882' AND status = '未架電';
-- TM3886: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-04-02）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3886' AND status = '未架電';
-- TM3889: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-04-05）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3889' AND status = '未架電';
-- TM3890: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-04-05）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3890' AND status = '未架電';
-- TM3892: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-04-05）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-24', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3892' AND status = '未架電';
-- TM3898: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-04-09）
UPDATE call_records SET status_is = '失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3898' AND status = '未架電';
-- TM3900: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-04-09）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3900' AND status = '未架電';
-- TM3906: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-04-11）
UPDATE call_records SET status_is = '失注', result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3906' AND status = '未架電';
-- TM3907: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-04-11）
UPDATE call_records SET status_is = '失注', result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3907' AND status = '未架電';
-- TM3909: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-04-12）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3909' AND status = '未架電';
-- TM3913: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-04-15）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3913' AND status = '未架電';
-- TM3916: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-04-15）
UPDATE call_records SET status_is = '失注', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3916' AND status = '未架電';
-- TM3919: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-04-16）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3919' AND status = '未架電';
-- TM3933: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-04-23）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3933' AND status = '未架電';
-- TM3934: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-04-23）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3934' AND status = '未架電';
-- TM3935: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-04-23）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3935' AND status = '未架電';
-- TM3939: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-04-25）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-28', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3939' AND status = '未架電';
-- TM3946: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-05-01）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-28', staff_is = '奥谷', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3946' AND status = '未架電';
-- TM3949: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-05-07）
UPDATE call_records SET status_is = '07.既存顧客', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3949' AND status = '未架電';
-- TM3950: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-05-07）
UPDATE call_records SET status_is = '失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-28', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3950' AND status = '未架電';
-- TM3952: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-05-07）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3952' AND status = '未架電';
-- TM3953: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-05-07）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '奥谷', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3953' AND status = '未架電';
-- TM3957: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-05-08）
UPDATE call_records SET status_is = '08.掛け直し（通電・アポ前）', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '奥谷', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3957' AND status = '未架電';
-- TM3958: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-05-08）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3958' AND status = '未架電';
-- TM3961: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-05-09）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-05-12', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3961' AND status = '未架電';
-- TM3962: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-05-13）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3962' AND status = '未架電';
-- TM3963: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-05-13）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3963' AND status = '未架電';
-- TM3965: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-05-13）
UPDATE call_records SET status_is = '前も電話していらない', result_contact_status = '不通', call_count = 1, last_called_date = '2025-05-01', staff_is = '奥谷', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3965' AND status = '未架電';
-- TM3967: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-05-14）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3967' AND status = '未架電';
-- TM3969: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-05-14）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3969' AND status = '未架電';
-- TM3971: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-05-15）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3971' AND status = '未架電';
-- TM3973: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-05-15）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3973' AND status = '未架電';
-- TM3977: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-05-16）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3977' AND status = '未架電';
-- TM3980: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-05-16）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3980' AND status = '未架電';
-- TM3983: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-05-21）
UPDATE call_records SET status_is = '07.既存顧客', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3983' AND status = '未架電';
-- TM3985: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-05-21）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3985' AND status = '未架電';
-- TM3986: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-05-22）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3986' AND status = '未架電';
-- TM3990: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-05-24）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3990' AND status = '未架電';
-- TM3994: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-05-27）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3994' AND status = '未架電';
-- TM3998: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-05-27）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3998' AND status = '未架電';
-- TM4001: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-05-28）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-05-12', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4001' AND status = '未架電';
-- TM4005: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-05-30）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4005' AND status = '未架電';
-- TM4006: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-05-31）
UPDATE call_records SET status_is = '失注', result_contact_status = '未通', call_count = 3, last_called_date = '2025-04-09', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4006' AND status = '未架電';
-- TM4008: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-06-04）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4008' AND status = '未架電';
-- TM4009: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-06-04）
UPDATE call_records SET status_is = '07.既存顧客', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4009' AND status = '未架電';
-- TM4011: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-06-05）
UPDATE call_records SET status_is = '06.ナーチャリング対象', result_contact_status = '通電', call_count = 2, last_called_date = '2026-01-07', staff_is = '金山', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4011' AND status = '未架電';
-- TM4020: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-06-10）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4020' AND status = '未架電';
-- TM4022: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-06-10）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4022' AND status = '未架電';
-- TM4024: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-06-11）
UPDATE call_records SET status_is = '失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '奥谷', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4024' AND status = '未架電';
-- TM4028: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-06-12）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4028' AND status = '未架電';
-- TM4029: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-06-12）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4029' AND status = '未架電';
-- TM4030: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-06-13）
UPDATE call_records SET status_is = '失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-05-01', staff_is = '奥谷', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4030' AND status = '未架電';
-- TM4031: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-06-13）
UPDATE call_records SET status_is = '07.既存顧客', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4031' AND status = '未架電';
-- TM4034: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-06-14）
UPDATE call_records SET status_is = '失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '奥谷', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4034' AND status = '未架電';
-- TM4035: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-06-17）
UPDATE call_records SET status_is = '02.コンタクト試行中', result_contact_status = '通電', call_count = 1, last_called_date = '2026-01-07', staff_is = '金山', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4035' AND status = '未架電';
-- TM4041: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-06-18）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4041' AND status = '未架電';
-- TM4042: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-06-18）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4042' AND status = '未架電';
-- TM4043: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-06-18）
UPDATE call_records SET status_is = '07.既存顧客', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4043' AND status = '未架電';
-- TM4044: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-06-19）
UPDATE call_records SET status_is = '07.既存顧客', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4044' AND status = '未架電';
-- TM4045: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-06-20）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4045' AND status = '未架電';
-- TM4047: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-06-20）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-05-12', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4047' AND status = '未架電';
-- TM4049: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-06-20）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4049' AND status = '未架電';
-- TM4050: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-06-21）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4050' AND status = '未架電';
-- TM4051: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-06-21）
UPDATE call_records SET status_is = '07.既存顧客', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4051' AND status = '未架電';
-- TM4053: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-06-21）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4053' AND status = '未架電';
-- TM4055: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-06-24）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4055' AND status = '未架電';
-- TM4059: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-06-24）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4059' AND status = '未架電';
-- TM4061: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-06-25）
UPDATE call_records SET status_is = '失注', call_count = 1, last_called_date = '2025-04-22', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4061' AND status = '未架電';
-- TM4062: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-06-25）
UPDATE call_records SET status_is = '02.コンタクト試行中', result_contact_status = '不通', call_count = 2, last_called_date = '2026-01-08', staff_is = '谷口', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4062' AND status = '未架電';
-- TM4063: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-06-25）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4063' AND status = '未架電';
-- TM4066: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-06-26）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4066' AND status = '未架電';
-- TM4067: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-06-26）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4067' AND status = '未架電';
-- TM4069: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-06-27）
UPDATE call_records SET status_is = '失注', result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4069' AND status = '未架電';
-- TM4072: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-07-01）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4072' AND status = '未架電';
-- TM4073: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-07-01）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4073' AND status = '未架電';
-- TM4074: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-07-01）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4074' AND status = '未架電';
-- TM4076: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-07-01）
UPDATE call_records SET status_is = 'リサイクル対象', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-28', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4076' AND status = '未架電';
-- TM4078: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-07-02）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2026-01-07', staff_is = '金山', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4078' AND status = '未架電';
-- TM4080: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-07-03）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4080' AND status = '未架電';
-- TM4081: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-07-03）
UPDATE call_records SET status_is = '失注', result_contact_status = '不通', last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4081' AND status = '未架電';
-- TM4082: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-07-03）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4082' AND status = '未架電';
-- TM4084: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-07-03）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4084' AND status = '未架電';
-- TM4085: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-07-04）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4085' AND status = '未架電';
-- TM4087: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-07-04）
UPDATE call_records SET status_is = '失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4087' AND status = '未架電';
-- TM4093: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-07-05）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-04-23', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4093' AND status = '未架電';
-- TM4096: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-07-08）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4096' AND status = '未架電';
-- TM4097: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-07-08）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4097' AND status = '未架電';
-- TM4103: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-07-09）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4103' AND status = '未架電';
-- TM4106: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-07-10）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4106' AND status = '未架電';
-- TM4108: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-07-11）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4108' AND status = '未架電';
-- TM4127: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-07-19）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4127' AND status = '未架電';
-- TM4155: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-08-01）
UPDATE call_records SET status_is = '07.既存顧客', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-23', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4155' AND status = '未架電';
-- TM4160: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-08-05）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4160' AND status = '未架電';
-- TM4166: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-08-07）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-23', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4166' AND status = '未架電';
-- TM4180: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-08-19）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4180' AND status = '未架電';
-- TM4182: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-08-19）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4182' AND status = '未架電';
-- TM4183: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-08-19）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4183' AND status = '未架電';
-- TM4189: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-08-21）
UPDATE call_records SET status_is = '失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-23', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4189' AND status = '未架電';
-- TM4196: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-08-27）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4196' AND status = '未架電';
-- TM4199: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-08-28）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2026-01-07', staff_is = '金山', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4199' AND status = '未架電';
-- TM4203: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-08-29）
UPDATE call_records SET status_is = '失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-23', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4203' AND status = '未架電';
-- TM4206: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-09-03）
UPDATE call_records SET status_is = '失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-04-23', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4206' AND status = '未架電';
-- TM4211: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-09-04）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2026-01-08', staff_is = '金山', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4211' AND status = '未架電';
-- TM4218: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-09-04）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-12', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4218' AND status = '未架電';
-- TM4225: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-09-09）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-06-05', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4225' AND status = '未架電';
-- TM4229: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-09-09）
UPDATE call_records SET status_is = '06.未通電⑦', result_contact_status = '不通', call_count = 1, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4229' AND status = '未架電';
-- TM4235: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-09-09）
UPDATE call_records SET status_is = '08.掛け直し（通電・アポ前）', call_count = 1, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4235' AND status = '未架電';
-- TM4250: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-09-12）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4250' AND status = '未架電';
-- TM4272: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-09-19）
UPDATE call_records SET status_is = '失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4272' AND status = '未架電';
-- TM4282: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-09-20）
UPDATE call_records SET status_is = '失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4282' AND status = '未架電';
-- TM4284: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-09-24）
UPDATE call_records SET status_is = '失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4284' AND status = '未架電';
-- TM4294: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-09-26）
UPDATE call_records SET status_is = '失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-04-25', staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4294' AND status = '未架電';
-- TM4301: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-09-27）
UPDATE call_records SET status_is = '02.コンタクト試行中', result_contact_status = '不通', call_count = 2, last_called_date = '2026-01-08', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4301' AND status = '未架電';
-- TM4304: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-09-30）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4304' AND status = '未架電';
-- TM4308: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-10-01）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-12', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4308' AND status = '未架電';
-- TM4310: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-10-02）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-05-12', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4310' AND status = '未架電';
-- TM4311: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-10-02）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-05-12', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4311' AND status = '未架電';
-- TM4312: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-10-02）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-04-18', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4312' AND status = '未架電';
-- TM4318: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-10-03）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-12', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4318' AND status = '未架電';
-- TM4319: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-10-03）
UPDATE call_records SET status_is = '90.失注', call_count = 1, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4319' AND status = '未架電';
-- TM4322: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-10-04）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', call_count = 5, last_called_date = '2025-04-18', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4322' AND status = '未架電';
-- TM4324: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-10-04）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', call_count = 5, last_called_date = '2025-04-14', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4324' AND status = '未架電';
-- TM4332: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-10-07）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 5, last_called_date = '2025-06-05', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4332' AND status = '未架電';
-- TM4339: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-10-10）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4339' AND status = '未架電';
-- TM4343: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-10-11）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', call_count = 5, last_called_date = '2025-04-14', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4343' AND status = '未架電';
-- TM4349: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-10-15）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-04-18', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4349' AND status = '未架電';
-- TM4351: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-10-15）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-04-18', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4351' AND status = '未架電';
-- TM4361: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-10-17）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 3, last_called_date = '2025-04-09', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4361' AND status = '未架電';
-- TM4362: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-10-17）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4362' AND status = '未架電';
-- TM4368: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-10-21）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', call_count = 5, last_called_date = '2025-04-14', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4368' AND status = '未架電';
-- TM4371: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-10-22）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', call_count = 5, last_called_date = '2025-04-14', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4371' AND status = '未架電';
-- TM4378: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-10-24）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4378' AND status = '未架電';
-- TM4384: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-10-26）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', call_count = 5, last_called_date = '2025-05-14', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4384' AND status = '未架電';
-- TM4389: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-10-28）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4389' AND status = '未架電';
-- TM4391: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-10-28）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 3, last_called_date = '2025-04-09', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4391' AND status = '未架電';
-- TM4398: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-10-30）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-04-18', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4398' AND status = '未架電';
-- TM4403: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-10-31）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 4, last_called_date = '2025-04-14', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4403' AND status = '未架電';
-- TM4414: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-11-05）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4414' AND status = '未架電';
-- TM4416: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-11-07）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4416' AND status = '未架電';
-- TM4418: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-11-07）
UPDATE call_records SET status_is = '02.コンタクト試行中', result_contact_status = '不通', call_count = 5, last_called_date = '2026-01-07', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4418' AND status = '未架電';
-- TM4420: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-11-08）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4420' AND status = '未架電';
-- TM4422: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-11-08）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4422' AND status = '未架電';
-- TM4423: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-11-08）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4423' AND status = '未架電';
-- TM4425: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-11-10）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4425' AND status = '未架電';
-- TM4429: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-11-11）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4429' AND status = '未架電';
-- TM4430: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-11-11）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4430' AND status = '未架電';
-- TM4431: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-11-11）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 3, last_called_date = '2025-04-10', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4431' AND status = '未架電';
-- TM4433: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-11-11）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4433' AND status = '未架電';
-- TM4434: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-11-12）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4434' AND status = '未架電';
-- TM4444: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-11-13）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-15', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4444' AND status = '未架電';
-- TM4445: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-11-13）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-05-15', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4445' AND status = '未架電';
-- TM4453: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-11-18）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', call_count = 5, last_called_date = '2025-04-14', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4453' AND status = '未架電';
-- TM4470: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-11-21）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4470' AND status = '未架電';
-- TM4471: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-11-21）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4471' AND status = '未架電';
-- TM4476: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-11-21）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4476' AND status = '未架電';
-- TM4477: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-11-22）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4477' AND status = '未架電';
-- TM4484: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-11-25）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', call_count = 8, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4484' AND status = '未架電';
-- TM4486: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-11-25）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', call_count = 6, last_called_date = '2025-04-11', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4486' AND status = '未架電';
-- TM4487: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-11-25）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', call_count = 6, last_called_date = '2025-04-14', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4487' AND status = '未架電';
-- TM4488: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-11-26）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', call_count = 3, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4488' AND status = '未架電';
-- TM4490: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-11-26）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 4, last_called_date = '2025-04-09', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4490' AND status = '未架電';
-- TM4495: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-12-02）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4495' AND status = '未架電';
-- TM4516: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-12-16）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', call_count = 8, last_called_date = '2025-04-14', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4516' AND status = '未架電';
-- TM4518: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-12-16）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', call_count = 5, last_called_date = '2025-04-14', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4518' AND status = '未架電';
-- TM4520: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-12-16）
UPDATE call_records SET status_is = '02.コンタクト試行中', result_contact_status = '通電', call_count = 3, last_called_date = '2026-01-07', staff_is = '金山', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4520' AND status = '未架電';
-- TM4521: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-12-16）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-04-18', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4521' AND status = '未架電';
-- TM4535: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2024-12-26）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 4, last_called_date = '2025-05-15', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4535' AND status = '未架電';
-- TM4541: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-01-08）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', call_count = 1, last_called_date = '2025-04-10', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4541' AND status = '未架電';
-- TM4543: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-01-09）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', call_count = 2, last_called_date = '2025-04-10', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4543' AND status = '未架電';
-- TM4585: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-01-13）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', call_count = 2, last_called_date = '2025-04-10', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4585' AND status = '未架電';
-- TM4550: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-01-19）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 4, last_called_date = '2025-04-18', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4550' AND status = '未架電';
-- TM4551: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-01-20）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-04-10', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4551' AND status = '未架電';
-- TM4555: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-01-22）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-10', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4555' AND status = '未架電';
-- TM4556: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-01-24）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 3, last_called_date = '2025-04-10', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4556' AND status = '未架電';
-- TM4561: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-01-26）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-04-10', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4561' AND status = '未架電';
-- TM4565: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-01-28）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', call_count = 7, last_called_date = '2025-04-10', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4565' AND status = '未架電';
-- TM4567: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-01-30）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', call_count = 8, last_called_date = '2025-04-18', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4567' AND status = '未架電';
-- TM4569: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-01-31）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-04-10', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4569' AND status = '未架電';
-- TM4578: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-02-05）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', call_count = 2, last_called_date = '2025-04-10', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4578' AND status = '未架電';
-- TM4579: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-02-05）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-04-10', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4579' AND status = '未架電';
-- TM4590: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-02-12）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-04-09', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4590' AND status = '未架電';
-- TM4601: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-02-24）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-10', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4601' AND status = '未架電';
-- TM4603: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-02-26）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', call_count = 1, last_called_date = '2025-04-10', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4603' AND status = '未架電';
-- TM4613: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-03-02）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', call_count = 1, last_called_date = '2025-04-10', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4613' AND status = '未架電';
-- TM4630: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-03-05）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', call_count = 10, last_called_date = '2025-04-10', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4630' AND status = '未架電';
-- TM4632: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-03-05）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-10', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4632' AND status = '未架電';
-- TM4633: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-03-05）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-10', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4633' AND status = '未架電';
-- TM4636: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-03-06）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', call_count = 3, last_called_date = '2025-04-10', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4636' AND status = '未架電';
-- TM4637: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-03-06）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 3, last_called_date = '2025-07-23', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4637' AND status = '未架電';
-- TM4638: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-03-07）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', call_count = 1, last_called_date = '2025-04-10', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4638' AND status = '未架電';
-- TM4643: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-03-07）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-10', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4643' AND status = '未架電';
-- TM4646: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-03-09）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', call_count = 1, last_called_date = '2025-04-10', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4646' AND status = '未架電';
-- TM4647: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-03-10）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', call_count = 2, last_called_date = '2025-04-10', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4647' AND status = '未架電';
-- TM4651: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-03-10）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-04-10', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4651' AND status = '未架電';
-- TM4659: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-03-12）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-09', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4659' AND status = '未架電';
-- TM4661: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-03-12）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', call_count = 2, last_called_date = '2025-04-10', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4661' AND status = '未架電';
-- TM4664: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-03-13）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', call_count = 2, last_called_date = '2025-04-10', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4664' AND status = '未架電';
-- TM4666: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-03-14）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', call_count = 8, last_called_date = '2025-04-10', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4666' AND status = '未架電';
-- TM4668: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-03-15）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-07-23', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4668' AND status = '未架電';
-- TM4674: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-03-18）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', call_count = 2, last_called_date = '2025-04-10', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4674' AND status = '未架電';
-- TM4675: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-03-18）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', call_count = 2, last_called_date = '2025-04-10', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4675' AND status = '未架電';
-- TM4685: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-03-21）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', call_count = 6, last_called_date = '2025-04-10', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4685' AND status = '未架電';
-- TM4691: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-03-26）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', call_count = 7, last_called_date = '2025-04-10', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4691' AND status = '未架電';
-- TM4692: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-03-26）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', call_count = 2, last_called_date = '2025-04-10', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4692' AND status = '未架電';
-- TM4693: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-03-26）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', call_count = 2, last_called_date = '2025-04-10', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4693' AND status = '未架電';
-- TM4697: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-03-28）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 3, last_called_date = '2025-06-06', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4697' AND status = '未架電';
-- TM4700: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-03-30）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '未通', call_count = 1, last_called_date = '2025-04-10', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4700' AND status = '未架電';
-- TM4702: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-04-01）
UPDATE call_records SET status_is = '06.ナーチャリング対象', result_contact_status = '不通', call_count = 3, last_called_date = '2026-01-08', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4702' AND status = '未架電';
-- TM4707: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-04-02）
UPDATE call_records SET status_is = '06.ナーチャリング対象', result_contact_status = '通電', call_count = 3, last_called_date = '2025-12-17', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4707' AND status = '未架電';
-- TM4714: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-04-06）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-07', staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4714' AND status = '未架電';
-- TM4717: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-04-07）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 3, last_called_date = '2025-04-15', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4717' AND status = '未架電';
-- TM4718: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-04-07）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 3, last_called_date = '2025-04-17', staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4718' AND status = '未架電';
-- TM4722: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-04-09）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-04-11', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4722' AND status = '未架電';
-- TM4724: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-04-11）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-04-16', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4724' AND status = '未架電';
-- TM4725: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-04-15）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-16', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4725' AND status = '未架電';
-- TM4727: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-04-15）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-16', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4727' AND status = '未架電';
-- TM4729: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-04-17）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 4, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4729' AND status = '未架電';
-- TM4732: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-04-18）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 5, last_called_date = '2025-06-23', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4732' AND status = '未架電';
-- TM4733: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-04-21）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4733' AND status = '未架電';
-- TM4734: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-04-23）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-05-26', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4734' AND status = '未架電';
-- TM4738: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-04-25）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4738' AND status = '未架電';
-- TM4740: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-04-25）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-28', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4740' AND status = '未架電';
-- TM4741: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-04-27）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 3, last_called_date = '2025-05-27', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4741' AND status = '未架電';
-- TM4742: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-04-28）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '未架電', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4742' AND status = '未架電';
-- TM4744: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-04-29）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-05-12', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4744' AND status = '未架電';
-- TM4747: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-05-03）
UPDATE call_records SET status_is = '05.対応不可/対象外', result_contact_status = '通電', call_count = 1, last_called_date = '2025-06-05', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4747' AND status = '未架電';
-- TM4749: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-05-08）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-05-19', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4749' AND status = '未架電';
-- TM4751: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-05-13）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-05-14', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4751' AND status = '未架電';
-- TM4753: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-05-14）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '未架電', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4753' AND status = '未架電';
-- TM4754: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-05-15）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-05-19', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4754' AND status = '未架電';
-- TM4755: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-05-15）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 3, last_called_date = '2025-05-19', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4755' AND status = '未架電';
-- TM4756: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-05-16）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-05-26', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4756' AND status = '未架電';
-- TM4757: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-05-16）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-05-19', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4757' AND status = '未架電';
-- TM4759: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-05-16）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 5, last_called_date = '2025-05-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4759' AND status = '未架電';
-- TM4760: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-05-16）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-05-19', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4760' AND status = '未架電';
-- TM4761: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-05-16）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-05-19', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4761' AND status = '未架電';
-- TM4764: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-05-22）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-05-26', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4764' AND status = '未架電';
-- TM4765: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-05-21）
UPDATE call_records SET status_is = '05.対応不可/対象外', result_contact_status = '未架電', staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4765' AND status = '未架電';
-- TM4767: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-05-22）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-05-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4767' AND status = '未架電';
-- TM4769: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-05-23）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-05-26', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4769' AND status = '未架電';
-- TM4771: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-05-28）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 3, last_called_date = '2025-06-05', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4771' AND status = '未架電';
-- TM4772: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-05-29）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-05-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4772' AND status = '未架電';
-- TM4779: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-06-09）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-06-06', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4779' AND status = '未架電';
-- TM4780: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-06-06）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-06-06', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4780' AND status = '未架電';
-- TM4784: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-06-14）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-06-16', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4784' AND status = '未架電';
-- TM4787: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-06-16）
UPDATE call_records SET status_is = '05.対応不可/対象外', result_contact_status = '通電', call_count = 4, last_called_date = '2025-06-19', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4787' AND status = '未架電';
-- TM4788: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-06-16）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-06-23', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4788' AND status = '未架電';
-- TM4789: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-06-16）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-06-16', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4789' AND status = '未架電';
-- TM4790: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-06-17）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-06-20', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4790' AND status = '未架電';
-- TM4791: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-06-16）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 3, last_called_date = '2025-06-17', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4791' AND status = '未架電';
-- TM4792: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-06-17）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-06-17', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4792' AND status = '未架電';
-- TM4793: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-06-17）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-06-23', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4793' AND status = '未架電';
-- TM4797: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-06-18）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-06-19', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4797' AND status = '未架電';
-- TM4798: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-06-19）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 3, last_called_date = '2025-06-23', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4798' AND status = '未架電';
-- TM4800: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-06-19）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-07-14', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4800' AND status = '未架電';
-- TM4803: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-06-22）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-06-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4803' AND status = '未架電';
-- TM4805: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-06-23）
UPDATE call_records SET status_is = '05.対応不可/対象外', result_contact_status = '未架電', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4805' AND status = '未架電';
-- TM4811: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-06-24）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-06-27', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4811' AND status = '未架電';
-- TM4812: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-06-26）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-07-14', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4812' AND status = '未架電';
-- TM4813: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-06-26）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-06-27', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4813' AND status = '未架電';
-- TM4814: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-06-27）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-07-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4814' AND status = '未架電';
-- TM4815: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-06-27）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-07-16', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4815' AND status = '未架電';
-- TM4817: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-06-28）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-07-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4817' AND status = '未架電';
-- TM4818: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-06-30）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', last_called_date = '2025-12-17', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4818' AND status = '未架電';
-- TM4822: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-07-03）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-07-11', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4822' AND status = '未架電';
-- TM4824: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-07-04）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-07-14', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4824' AND status = '未架電';
-- TM4827: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-07-06）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-07-14', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4827' AND status = '未架電';
-- TM4828: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-07-08）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-07-11', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4828' AND status = '未架電';
-- TM4830: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-07-09）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-07-11', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4830' AND status = '未架電';
-- TM4831: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-07-10）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-07-18', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4831' AND status = '未架電';
-- TM4832: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-07-10）
UPDATE call_records SET status_is = '05.対応不可/対象外', result_contact_status = '未架電', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4832' AND status = '未架電';
-- TM4833: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-07-10）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-07-14', staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4833' AND status = '未架電';
-- TM4834: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-07-10）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-07-14', staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4834' AND status = '未架電';
-- TM4837: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-07-14）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-07-15', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4837' AND status = '未架電';
-- TM4840: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-07-14）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-07-15', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4840' AND status = '未架電';
-- TM4841: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-07-16）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-07-18', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4841' AND status = '未架電';
-- TM4842: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-07-16）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-10-06', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4842' AND status = '未架電';
-- TM4847: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-07-18）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-08-07', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4847' AND status = '未架電';
-- TM4849: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-07-19）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-08-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4849' AND status = '未架電';
-- TM4850: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-07-21）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-07-23', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4850' AND status = '未架電';
-- TM4852: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-07-24）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-08-13', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4852' AND status = '未架電';
-- TM4853: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-07-25）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-07-31', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4853' AND status = '未架電';
-- TM4854: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-07-29）
UPDATE call_records SET status_is = '02.コンタクト試行中', result_contact_status = '不通', call_count = 1, last_called_date = '2025-12-17', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4854' AND status = '未架電';
-- TM4857: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-07-31）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-08-04', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4857' AND status = '未架電';
-- OC0142: CSVに明示的なデータがある（未架電→架電済に修正）
UPDATE call_records SET status_is = '02.コンタクト試行中', result_contact_status = '通電', call_count = 2, last_called_date = '2025-12-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'OC0142' AND status = '未架電';
-- OC0151: CSVに明示的なデータがある（未架電→架電済に修正）
UPDATE call_records SET status_is = '02.コンタクト試行中', result_contact_status = '不通', call_count = 3, last_called_date = '2025-12-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'OC0151' AND status = '未架電';
-- OC0156: CSVに明示的なデータがある（未架電→架電済に修正）
UPDATE call_records SET status_is = '06.ナーチャリング対象', result_contact_status = '通電', call_count = 3, last_called_date = '2025-12-09', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'OC0156' AND status = '未架電';
-- OC0166: CSVに明示的なデータがある（未架電→架電済に修正）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-12-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'OC0166' AND status = '未架電';
-- OC0167: CSVに明示的なデータがある（未架電→架電済に修正）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 4, last_called_date = '2025-12-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'OC0167' AND status = '未架電';
-- OC0172: CSVに明示的なデータがある（未架電→架電済に修正）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-10-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'OC0172' AND status = '未架電';
-- OC0176: CSVに明示的なデータがある（未架電→架電済に修正）
UPDATE call_records SET status_is = '06.ナーチャリング対象', result_contact_status = '通電', call_count = 2, last_called_date = '2025-12-09', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'OC0176' AND status = '未架電';
-- OC0178: CSVに明示的なデータがある（未架電→架電済に修正）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 3, last_called_date = '2025-10-23', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'OC0178' AND status = '未架電';
-- OC0179: CSVに明示的なデータがある（未架電→架電済に修正）
UPDATE call_records SET status_is = '02.コンタクト試行中', result_contact_status = '通電', call_count = 3, last_called_date = '2025-12-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'OC0179' AND status = '未架電';
-- OC0188: CSVに明示的なデータがある（未架電→架電済に修正）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 4, last_called_date = '2025-12-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'OC0188' AND status = '未架電';
-- OC0189: CSVに明示的なデータがある（未架電→架電済に修正）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-10-23', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'OC0189' AND status = '未架電';
-- TM4860: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-08-05）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 4, last_called_date = '2025-08-13', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4860' AND status = '未架電';
-- TM4863: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-08-07）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-08-13', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4863' AND status = '未架電';
-- TM4864: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-08-07）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-08-08', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4864' AND status = '未架電';
-- TM4865: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-08-08）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-08-12', staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4865' AND status = '未架電';
-- TM4866: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-08-08）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-08-12', staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4866' AND status = '未架電';
-- TM4867: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-08-09）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-08-14', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4867' AND status = '未架電';
-- TM4868: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-08-09）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-09-08', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4868' AND status = '未架電';
-- TM4871: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-08-12）
UPDATE call_records SET status_is = '05.対応不可/対象外', result_contact_status = '未架電', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4871' AND status = '未架電';
-- TM4873: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-08-14）
UPDATE call_records SET status_is = '06.ナーチャリング対象', result_contact_status = '通電', call_count = 2, last_called_date = '2026-01-15', staff_is = '金山', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4873' AND status = '未架電';
-- TM4876: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-08-20）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-09-08', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4876' AND status = '未架電';
-- TM4879: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-08-21）
UPDATE call_records SET status_is = '06.ナーチャリング対象', result_contact_status = '通電', call_count = 2, last_called_date = '2026-01-15', staff_is = '金山', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4879' AND status = '未架電';
-- TM4880: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-08-22）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 5, last_called_date = '2025-12-24', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4880' AND status = '未架電';
-- TM4882: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-08-28）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 3, last_called_date = '2025-10-08', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4882' AND status = '未架電';
-- TM4883: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-08-28）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-09-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4883' AND status = '未架電';
-- TM4884: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-08-29）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-09-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4884' AND status = '未架電';
-- TM4886: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-09-02）
UPDATE call_records SET status_is = '05.対応不可/対象外', result_contact_status = '不通', call_count = 1, last_called_date = '2025-09-03', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4886' AND status = '未架電';
-- TM4889: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-09-03）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 5, last_called_date = '2025-09-12', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4889' AND status = '未架電';
-- TM4896: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-09-10）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 4, last_called_date = '2025-09-17', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4896' AND status = '未架電';
-- TM4897: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-09-11）
UPDATE call_records SET status_is = '05.対応不可/対象外', result_contact_status = '不通', call_count = 2, last_called_date = '2025-09-16', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4897' AND status = '未架電';
-- TM4899: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-09-16）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-09-18', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4899' AND status = '未架電';
-- TM4901: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-09-18）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-09-19', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4901' AND status = '未架電';
-- TM4902: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-09-18）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 4, last_called_date = '2025-10-24', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4902' AND status = '未架電';
-- TM4903: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-09-18）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-10-09', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4903' AND status = '未架電';
-- TM4905: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-09-19）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 3, last_called_date = '2025-10-08', staff_is = '沢田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4905' AND status = '未架電';
-- TM4909: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-09-21）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-12-24', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4909' AND status = '未架電';
-- TM4910: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-09-22）
UPDATE call_records SET status_is = '02.コンタクト試行中', result_contact_status = '不通', call_count = 5, last_called_date = '2026-01-16', staff_is = '金山', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4910' AND status = '未架電';
-- TM4914: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-09-24）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-09-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4914' AND status = '未架電';
-- TM4915: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-09-25）
UPDATE call_records SET status_is = '05.対応不可/対象外', result_contact_status = '未架電', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4915' AND status = '未架電';
-- TM4920: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-09-29）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-10-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4920' AND status = '未架電';
-- TM4922: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-09-30）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 3, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4922' AND status = '未架電';
-- TM4924: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-10-02）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-10-03', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4924' AND status = '未架電';
-- TM4927: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-10-03）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-10-03', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4927' AND status = '未架電';
-- TM4929: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-10-04）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 5, last_called_date = '2025-11-20', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4929' AND status = '未架電';
-- TM4930: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-10-06）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 2, last_called_date = '2025-10-07', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4930' AND status = '未架電';
-- TM4931: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-10-06）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 3, last_called_date = '2025-10-15', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4931' AND status = '未架電';
-- TM4933: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-10-07）
UPDATE call_records SET status_is = '06.ナーチャリング対象', result_contact_status = '通電', call_count = 2, last_called_date = '2026-01-15', staff_is = '金山', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4933' AND status = '未架電';
-- TM4934: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-10-07）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-10-23', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4934' AND status = '未架電';
-- TM4936: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-10-08）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-10-09', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4936' AND status = '未架電';
-- TM4937: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-10-09）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 5, last_called_date = '2025-10-23', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4937' AND status = '未架電';
-- TM4939: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-10-10）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-10-15', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4939' AND status = '未架電';
-- TM4943: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-10-16）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-10-24', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4943' AND status = '未架電';
-- OC0195: CSVに明示的なデータがある（未架電→架電済に修正）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-10-23', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'OC0195' AND status = '未架電';
-- TM4944: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-10-17）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-10-20', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4944' AND status = '未架電';
-- TM4946: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-10-17）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-10-20', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4946' AND status = '未架電';
-- TM4947: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-10-20）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-10-21', staff_is = '沢田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4947' AND status = '未架電';
-- TM4948: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-10-20）
UPDATE call_records SET status_is = '06.ナーチャリング対象', result_contact_status = '通電', call_count = 5, last_called_date = '2025-11-28', staff_is = '沢田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4948' AND status = '未架電';
-- OC0198: CSVに明示的なデータがある（未架電→架電済に修正）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-11-12', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'OC0198' AND status = '未架電';
-- TM4950: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-10-20）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-10-24', staff_is = '沢田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4950' AND status = '未架電';
-- TM4953: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-10-20）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 4, last_called_date = '2025-11-20', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4953' AND status = '未架電';
-- TM4954: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-10-21）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 3, last_called_date = '2025-10-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4954' AND status = '未架電';
-- TM4958: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-10-21）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 3, last_called_date = '2025-11-11', staff_is = '沢田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4958' AND status = '未架電';
-- OC0203: CSVに明示的なデータがある（未架電→架電済に修正）
UPDATE call_records SET status_is = '06.ナーチャリング対象', result_contact_status = '通電', call_count = 1, last_called_date = '2025-10-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'OC0203' AND status = '未架電';
-- TM4959: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-10-22）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 4, last_called_date = '2025-11-12', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4959' AND status = '未架電';
-- TM4965: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-10-24）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-10-28', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4965' AND status = '未架電';
-- TM4966: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-10-24）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-10-28', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4966' AND status = '未架電';
-- TM4967: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-10-24）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-10-27', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4967' AND status = '未架電';
-- TM4973: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-10-30）
UPDATE call_records SET status_is = '06.ナーチャリング対象', result_contact_status = '通電', call_count = 5, last_called_date = '2026-01-15', staff_is = '金山', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4973' AND status = '未架電';
-- TM4974: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-10-31）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-11-04', staff_is = '沢田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4974' AND status = '未架電';
-- TM4975: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-10-31）
UPDATE call_records SET status_is = '02.コンタクト試行中', result_contact_status = '通電', call_count = 3, last_called_date = '2026-01-16', staff_is = '金山', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4975' AND status = '未架電';
-- TM4976: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-11-03）
UPDATE call_records SET status_is = '02.コンタクト試行中', result_contact_status = '不通', call_count = 4, last_called_date = '2026-01-16', staff_is = '金山', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4976' AND status = '未架電';
-- TM4980: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-11-06）
UPDATE call_records SET status_is = '06.ナーチャリング対象', result_contact_status = '不通', call_count = 5, last_called_date = '2026-01-16', staff_is = '金山', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4980' AND status = '未架電';
-- TM4982: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-11-07）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-11-18', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4982' AND status = '未架電';
-- TM4983: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-11-07）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-11-10', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4983' AND status = '未架電';
-- TM4984: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-11-07）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 2, last_called_date = '2025-11-11', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4984' AND status = '未架電';
-- OC0228: CSVに明示的なデータがある（未架電→架電済に修正）
UPDATE call_records SET status_is = '02.コンタクト試行中', result_contact_status = '通電', call_count = 1, last_called_date = '2025-11-10', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'OC0228' AND status = '未架電';
-- TM4985: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-11-10）
UPDATE call_records SET status_is = '02.コンタクト試行中', result_contact_status = '通電', call_count = 5, last_called_date = '2026-01-15', staff_is = '金山', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4985' AND status = '未架電';
-- TM4988: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-11-12）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-11-13', staff_is = '沢田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4988' AND status = '未架電';
-- TM4989: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-11-12）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-11-13', staff_is = '沢田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4989' AND status = '未架電';
-- OC0230: CSVに明示的なデータがある（未架電→架電済に修正）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 3, last_called_date = '2025-11-28', staff_is = '沢田', status = '架電中', updated_at = NOW() WHERE lead_id = 'OC0230' AND status = '未架電';
-- OC0232: CSVに明示的なデータがある（未架電→架電済に修正）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 5, last_called_date = '2025-11-26', staff_is = '沢田', status = '架電中', updated_at = NOW() WHERE lead_id = 'OC0232' AND status = '未架電';
-- TM4992: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-11-14）
UPDATE call_records SET status_is = '05.対応不可/対象外', result_contact_status = '不通', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4992' AND status = '未架電';
-- TM4993: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-11-14）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-11-17', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4993' AND status = '未架電';
-- TM4995: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-11-17）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-11-20', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4995' AND status = '未架電';
-- OC0241: CSVに明示的なデータがある（未架電→架電済に修正）
UPDATE call_records SET status_is = '02.コンタクト試行中', result_contact_status = '通電', call_count = 5, last_called_date = '2025-12-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'OC0241' AND status = '未架電';
-- TM4996: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-11-18）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-11-19', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4996' AND status = '未架電';
-- TM5000: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-11-20）
UPDATE call_records SET status_is = '04.失注（ナーチャリング対象外）', result_contact_status = '通電', call_count = 2, last_called_date = '2026-01-16', staff_is = '沢田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM5000' AND status = '未架電';
-- TM5002: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-11-21）
UPDATE call_records SET status_is = '05.対応不可/対象外', result_contact_status = '不通', call_count = 5, last_called_date = '2025-12-02', staff_is = '沢田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM5002' AND status = '未架電';
-- TM5003: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-11-25）
UPDATE call_records SET status_is = '05.対応不可/対象外', result_contact_status = '通電', call_count = 1, last_called_date = '2025-11-26', staff_is = '沢田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM5003' AND status = '未架電';
-- TM5004: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-11-26）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-12-17', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM5004' AND status = '未架電';
-- TM5005: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-11-27）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 4, last_called_date = '2025-12-12', staff_is = '沢田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM5005' AND status = '未架電';
-- OC0253: CSVに明示的なデータがある（未架電→架電済に修正）
UPDATE call_records SET status_is = '06.ナーチャリング対象', result_contact_status = '通電', call_count = 1, last_called_date = '2025-12-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'OC0253' AND status = '未架電';
-- TM5011: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-12-03）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-12-12', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM5011' AND status = '未架電';
-- TM5012: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-12-03）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-12-09', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM5012' AND status = '未架電';
-- TM5013: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-12-04）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-12-05', staff_is = '沢田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM5013' AND status = '未架電';
-- TM5015: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-12-07）
UPDATE call_records SET status_is = '02.コンタクト試行中', result_contact_status = '不通', call_count = 5, last_called_date = '2026-01-16', staff_is = '金山', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM5015' AND status = '未架電';
-- TM5018: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-12-15）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-12-16', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM5018' AND status = '未架電';
-- TM5020: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-12-17）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-12-18', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM5020' AND status = '未架電';
-- TM5021: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-12-17）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-12-19', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM5021' AND status = '未架電';
-- TM5023: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-12-18）
UPDATE call_records SET status_is = '04.失注（ナーチャリング対象外）', result_contact_status = '通電', call_count = 3, last_called_date = '2026-01-16', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM5023' AND status = '未架電';
-- TM5025: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2025-12-21）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 3, last_called_date = '2025-12-24', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM5025' AND status = '未架電';
-- OC0280: CSVに明示的なデータがある（未架電→架電済に修正）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 5, last_called_date = '2026-01-06', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'OC0280' AND status = '未架電';
-- OC0281: CSVに明示的なデータがある（未架電→架電済に修正）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 5, last_called_date = '2026-01-06', staff_is = '沢田', status = '架電中', updated_at = NOW() WHERE lead_id = 'OC0281' AND status = '未架電';
-- TM5028: CSVに明示的なデータがある（未架電→架電済に修正、連携日: 2026-01-06）
UPDATE call_records SET status_is = '02.コンタクト試行中', result_contact_status = '不通', call_count = 3, last_called_date = '2026-01-16', staff_is = '金山', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM5028' AND status = '未架電';
-- OC0301: CSVに明示的なデータがある（未架電→架電済に修正）
UPDATE call_records SET status_is = '02.コンタクト試行中', result_contact_status = '通電', call_count = 1, last_called_date = '2026-01-06', staff_is = '沢田', status = '架電中', updated_at = NOW() WHERE lead_id = 'OC0301' AND status = '未架電';

-- ============================================
-- カテゴリ2: 推測ロジックを適用するレコード
-- ============================================
-- 件数: 461件

-- TM3608: 推測ロジック適用 (対応不可/失注理由(番号違い)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3608' AND status = '未架電';
-- TM3611: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(12.トスミス：詳細記載)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(谷口)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '谷口', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3611' AND status = '未架電';
-- TM3628: 推測ロジック適用 (結果/コンタクト状況(未通)が存在, 担当IS(加藤)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET result_contact_status = '未通', call_count = 1, staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3628' AND status = '未架電';
-- TM3629: 推測ロジック適用 (直近架電日(2025-04-28)が存在 → 必ず架電している, 会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(12.トスミス：詳細記載)が存在 → 通電している可能性が極めて高い, ISステータス(失注)が存在, 担当IS(加藤)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-28', staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3629' AND status = '未架電';
-- TM3641: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(税理士契約済)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3641' AND status = '未架電';
-- TM3644: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3644' AND status = '未架電';
-- TM3646: 推測ロジック適用 (直近架電日(2025-05-01)が存在 → 必ず架電している, 対応不可/失注理由(知り合いの税理士のところで契約している。近場の税理士が良いとのこと。)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(未通)が存在, 担当IS(加藤)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '未通', call_count = 1, last_called_date = '2025-05-01', staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3646' AND status = '未架電';
-- TM3647: 推測ロジック適用 (直近架電日(2025-04-28)が存在 → 必ず架電している, 会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(12.トスミス：詳細記載)が存在 → 通電している可能性が極めて高い, ISステータス(失注)が存在, 担当IS(加藤)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-28', staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3647' AND status = '未架電';
-- TM3654: 推測ロジック適用 (直近架電日(2025-05-01)が存在 → 必ず架電している, 対応不可/失注理由(折り返しきたが取れず。)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(未通)が存在, 担当IS(加藤)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '未通', call_count = 1, last_called_date = '2025-05-01', staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3654' AND status = '未架電';
-- TM3657: 推測ロジック適用 (対応不可/失注理由(ケーキ屋を1人で切り盛りしている。奥様が経理を握っているとのこと。)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(加藤)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3657' AND status = '未架電';
-- TM3660: 推測ロジック適用 (直近架電日(2025-05-01)が存在 → 必ず架電している, 会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, ISステータス(保留)が存在, 担当IS(加藤)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '保留', result_contact_status = '通電', call_count = 1, last_called_date = '2025-05-01', staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3660' AND status = '未架電';
-- TM3667: 推測ロジック適用 (直近架電日(2025-05-01)が存在 → 必ず架電している, 結果/コンタクト状況(未通)が存在, 担当IS(加藤)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET result_contact_status = '未通', call_count = 1, last_called_date = '2025-05-01', staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3667' AND status = '未架電';
-- TM3673: 推測ロジック適用 (直近架電日(2025-05-01)が存在 → 必ず架電している, 対応不可/失注理由(興味を完全に引き付けられず)が存在 → 通電している可能性が極めて高い, ISステータス(失注)が存在, 担当IS(加藤)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-05-01', staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3673' AND status = '未架電';
-- TM3677: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(谷口)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '谷口', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3677' AND status = '未架電';
-- TM3678: 推測ロジック適用 (直近架電日(2025-04-28)が存在 → 必ず架電している, 対応不可/失注理由(12.トスミス：詳細記載)が存在 → 通電している可能性が極めて高い, ISステータス(留守電に直通)が存在, 担当IS(加藤)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '留守電に直通', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-28', staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3678' AND status = '未架電';
-- TM3681: 推測ロジック適用 (直近架電日(2025-04-28)が存在 → 必ず架電している, 会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, 担当IS(加藤)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-28', staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3681' AND status = '未架電';
-- TM3685: 推測ロジック適用 (直近架電日(2025-05-01)が存在 → 必ず架電している, 結果/コンタクト状況(未通)が存在, 担当IS(加藤)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET result_contact_status = '未通', call_count = 1, last_called_date = '2025-05-01', staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3685' AND status = '未架電';
-- TM3687: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(谷口)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '谷口', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3687' AND status = '未架電';
-- TM3688: 推測ロジック適用 (対応不可/失注理由(12.トスミス：詳細記載)が存在 → 通電している可能性が極めて高い)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3688' AND status = '未架電';
-- TM3696: 推測ロジック適用 (直近架電日(2025-04-18)が存在 → 必ず架電している, 担当IS(小林)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET call_count = 1, last_called_date = '2025-04-18', staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3696' AND status = '未架電';
-- TM3702: 推測ロジック適用 (対応不可/失注理由(4. IS：日本語不可)が存在 → 通電している可能性が極めて高い, ISステータス(04.失注)が存在, 担当IS(加藤)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3702' AND status = '未架電';
-- TM3705: 推測ロジック適用 (直近架電日(2025-05-01)が存在 → 必ず架電している, 結果/コンタクト状況(未通)が存在, 担当IS(加藤)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET result_contact_status = '未通', call_count = 1, last_called_date = '2025-05-01', staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3705' AND status = '未架電';
-- TM3706: 推測ロジック適用 (直近架電日(2025-04-15)が存在 → 必ず架電している, 対応不可/失注理由(電話番号使われていない)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(未通)が存在, 担当IS(小林)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '未通', call_count = 1, last_called_date = '2025-04-15', staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3706' AND status = '未架電';
-- TM3707: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(谷口)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '谷口', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3707' AND status = '未架電';
-- TM3709: 推測ロジック適用 (直近架電日(2025-05-01)が存在 → 必ず架電している, 対応不可/失注理由(別事業で飲食店を開こうとしているとのこと。日井物産の顧問税理士が30年程契約している。)が存在 → 通電している可能性が極めて高い, ISステータス(失注)が存在, 担当IS(加藤)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-05-01', staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3709' AND status = '未架電';
-- TM3713: 推測ロジック適用 (直近架電日(2025-04-18)が存在 → 必ず架電している, 担当IS(小林)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET call_count = 1, last_called_date = '2025-04-18', staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3713' AND status = '未架電';
-- TM3717: 推測ロジック適用 (直近架電日(2025-05-01)が存在 → 必ず架電している, 結果/コンタクト状況(未通)が存在, 担当IS(加藤)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET result_contact_status = '未通', call_count = 1, last_called_date = '2025-05-01', staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3717' AND status = '未架電';
-- TM3720: 推測ロジック適用 (直近架電日(2025-04-18)が存在 → 必ず架電している, 担当IS(小林)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET call_count = 1, last_called_date = '2025-04-18', staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3720' AND status = '未架電';
-- TM3723: 推測ロジック適用 (直近架電日(2025-04-24)が存在 → 必ず架電している, 対応不可/失注理由(4. IS：日本語不可)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-24', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3723' AND status = '未架電';
-- TM3724: 推測ロジック適用 (直近架電日(2025-05-01)が存在 → 必ず架電している, 結果/コンタクト状況(未通)が存在, 担当IS(加藤)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET result_contact_status = '未通', call_count = 1, last_called_date = '2025-05-01', staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3724' AND status = '未架電';
-- TM3725: 推測ロジック適用 (直近架電日(2025-04-15)が存在 → 必ず架電している, 結果/コンタクト状況(未通)が存在, 担当IS(小林)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET result_contact_status = '未通', call_count = 1, last_called_date = '2025-04-15', staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3725' AND status = '未架電';
-- TM3730: 推測ロジック適用 (直近架電日(2025-04-15)が存在 → 必ず架電している, 結果/コンタクト状況(未通)が存在, 担当IS(小林)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET result_contact_status = '未通', call_count = 1, last_called_date = '2025-04-15', staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3730' AND status = '未架電';
-- TM3733: 推測ロジック適用 (直近架電日(2025-04-15)が存在 → 必ず架電している, 結果/コンタクト状況(未通)が存在, 担当IS(小林)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET result_contact_status = '未通', call_count = 1, last_called_date = '2025-04-15', staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3733' AND status = '未架電';
-- TM3734: 推測ロジック適用 (直近架電日(2025-04-15)が存在 → 必ず架電している, 結果/コンタクト状況(未通)が存在, 担当IS(小林)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET result_contact_status = '未通', call_count = 1, last_called_date = '2025-04-15', staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3734' AND status = '未架電';
-- TM3739: 推測ロジック適用 (直近架電日(2025-04-18)が存在 → 必ず架電している, 担当IS(小林)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET call_count = 1, last_called_date = '2025-04-18', staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3739' AND status = '未架電';
-- TM3741: 推測ロジック適用 (直近架電日(2025-04-18)が存在 → 必ず架電している, 担当IS(小林)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET call_count = 1, last_called_date = '2025-04-18', staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3741' AND status = '未架電';
-- TM3742: 推測ロジック適用 (直近架電日(2025-04-15)が存在 → 必ず架電している, 結果/コンタクト状況(未通)が存在, 担当IS(小林)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET result_contact_status = '未通', call_count = 1, last_called_date = '2025-04-15', staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3742' AND status = '未架電';
-- TM3745: 推測ロジック適用 (直近架電日(2025-04-15)が存在 → 必ず架電している, 結果/コンタクト状況(未通)が存在, 担当IS(小林)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET result_contact_status = '未通', call_count = 1, last_called_date = '2025-04-15', staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3745' AND status = '未架電';
-- TM3748: 推測ロジック適用 (直近架電日(2025-04-28)が存在 → 必ず架電している, 会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, ISステータス(失注)が存在, 担当IS(加藤)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-28', staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3748' AND status = '未架電';
-- TM3752: 推測ロジック適用 (直近架電日(2025-04-24)が存在 → 必ず架電している, 対応不可/失注理由(4. IS：日本語不可)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-24', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3752' AND status = '未架電';
-- TM3753: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(4. IS：日本語不可)が存在 → 通電している可能性が極めて高い, ISステータス(失注)が存在, 担当IS(加藤)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3753' AND status = '未架電';
-- TM3754: 推測ロジック適用 (対応不可/失注理由(4. IS：日本語不可)が存在 → 通電している可能性が極めて高い, ISステータス(失注)が存在, 担当IS(加藤)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3754' AND status = '未架電';
-- TM3755: 推測ロジック適用 (直近架電日(2025-04-18)が存在 → 必ず架電している, 担当IS(小林)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET call_count = 1, last_called_date = '2025-04-18', staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3755' AND status = '未架電';
-- TM3757: 推測ロジック適用 (直近架電日(2025-04-18)が存在 → 必ず架電している, ISステータス(07.既存顧客)が存在, 担当IS(小林)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '07.既存顧客', call_count = 1, last_called_date = '2025-04-18', staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3757' AND status = '未架電';
-- TM3759: 推測ロジック適用 (対応不可/失注理由(4. IS：日本語不可)が存在 → 通電している可能性が極めて高い, ISステータス(04.失注)が存在, 担当IS(加藤)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3759' AND status = '未架電';
-- TM3760: 推測ロジック適用 (対応不可/失注理由(自己対応)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3760' AND status = '未架電';
-- TM3761: 推測ロジック適用 (直近架電日(2025-05-01)が存在 → 必ず架電している, 結果/コンタクト状況(未通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET result_contact_status = '未通', call_count = 2, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3761' AND status = '未架電';
-- TM3765: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(自己対応)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3765' AND status = '未架電';
-- TM3766: 推測ロジック適用 (直近架電日(2025-05-01)が存在 → 必ず架電している, 結果/コンタクト状況(未通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET result_contact_status = '未通', call_count = 2, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3766' AND status = '未架電';
-- TM3767: 推測ロジック適用 (直近架電日(2025-04-18)が存在 → 必ず架電している, 担当IS(小林)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET call_count = 1, last_called_date = '2025-04-18', staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3767' AND status = '未架電';
-- TM3768: 推測ロジック適用 (対応不可/失注理由(4. IS：日本語不可)が存在 → 通電している可能性が極めて高い)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3768' AND status = '未架電';
-- TM3769: 推測ロジック適用 (対応不可/失注理由(4. IS：日本語不可)が存在 → 通電している可能性が極めて高い, ISステータス(04.失注)が存在, 担当IS(加藤)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3769' AND status = '未架電';
-- TM3770: 推測ロジック適用 (対応不可/失注理由(12.トスミス：詳細記載)が存在 → 通電している可能性が極めて高い, ISステータス(04.失注)が存在, 担当IS(加藤)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3770' AND status = '未架電';
-- TM3776: 推測ロジック適用 (対応不可/失注理由(番号使われておらず)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3776' AND status = '未架電';
-- TM3777: 推測ロジック適用 (直近架電日(2025-05-01)が存在 → 必ず架電している, 結果/コンタクト状況(未通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET result_contact_status = '未通', call_count = 2, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3777' AND status = '未架電';
-- TM3779: 推測ロジック適用 (直近架電日(2025-05-01)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3779' AND status = '未架電';
-- TM3780: 推測ロジック適用 (直近架電日(2025-04-15)が存在 → 必ず架電している, 結果/コンタクト状況(未通)が存在, 担当IS(小林)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET result_contact_status = '未通', call_count = 1, last_called_date = '2025-04-15', staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3780' AND status = '未架電';
-- TM3781: 推測ロジック適用 (直近架電日(2025-04-18)が存在 → 必ず架電している, ISステータス(07.既存顧客)が存在, 担当IS(小林)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '07.既存顧客', call_count = 1, last_called_date = '2025-04-18', staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3781' AND status = '未架電';
-- TM3782: 推測ロジック適用 (対応不可/失注理由(12.トスミス：詳細記載)が存在 → 通電している可能性が極めて高い, ISステータス(04.失注)が存在, 担当IS(加藤)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3782' AND status = '未架電';
-- TM3783: 推測ロジック適用 (直近架電日(2025-05-01)が存在 → 必ず架電している, 会話メモが存在 → 架電して通電していると推測, 結果/コンタクト状況(未通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET result_contact_status = '未通', call_count = 2, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3783' AND status = '未架電';
-- TM3784: 推測ロジック適用 (対応不可/失注理由(4. IS：日本語不可)が存在 → 通電している可能性が極めて高い, ISステータス(04.失注)が存在, 担当IS(加藤)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3784' AND status = '未架電';
-- TM3788: 推測ロジック適用 (対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, ISステータス(07.既存顧客)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '07.既存顧客', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3788' AND status = '未架電';
-- TM3792: 推測ロジック適用 (対応不可/失注理由(12.トスミス：詳細記載)が存在 → 通電している可能性が極めて高い, ISステータス(途中で切られた)が存在, 担当IS(加藤)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '途中で切られた', result_contact_status = '通電', call_count = 1, staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3792' AND status = '未架電';
-- TM3800: 推測ロジック適用 (対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, ISステータス(04.失注)が存在, 担当IS(加藤)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, staff_is = '加藤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3800' AND status = '未架電';
-- TM3801: 推測ロジック適用 (対応不可/失注理由(税理士契約済)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3801' AND status = '未架電';
-- TM3807: 推測ロジック適用 (対応不可/失注理由(12.トスミス：詳細記載)が存在 → 通電している可能性が極めて高い)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3807' AND status = '未架電';
-- TM3808: 推測ロジック適用 (対応不可/失注理由(4. IS：日本語不可)が存在 → 通電している可能性が極めて高い)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3808' AND status = '未架電';
-- TM3814: 推測ロジック適用 (対応不可/失注理由(4. IS：日本語不可)が存在 → 通電している可能性が極めて高い)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3814' AND status = '未架電';
-- TM3831: 推測ロジック適用 (直近架電日(2025-04-16)が存在 → 必ず架電している, 会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(自己対応)が存在 → 通電している可能性が極めて高い, 担当IS(小林)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-16', staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3831' AND status = '未架電';
-- TM3846: 推測ロジック適用 (直近架電日(2025-05-01)が存在 → 必ず架電している, 結果/コンタクト状況(未通電)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET result_contact_status = '未通電', call_count = 3, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3846' AND status = '未架電';
-- TM3850: 推測ロジック適用 (対応不可/失注理由(22. FS：紹介税理士)が存在 → 通電している可能性が極めて高い)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3850' AND status = '未架電';
-- TM3862: 推測ロジック適用 (直近架電日(2025-04-30)が存在 → 必ず架電している, 対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3862' AND status = '未架電';
-- TM3874: 推測ロジック適用 (直近架電日(2025-05-01)が存在 → 必ず架電している, 結果/コンタクト状況(未通電)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET result_contact_status = '未通電', call_count = 2, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3874' AND status = '未架電';
-- TM3888: 推測ロジック適用 (対応不可/失注理由(12.トスミス：詳細記載)が存在 → 通電している可能性が極めて高い, ISステータス(失注)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3888' AND status = '未架電';
-- TM3895: 推測ロジック適用 (対応不可/失注理由(7. 対応不可：問い合せしていない)が存在 → 通電している可能性が極めて高い, ISステータス(失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3895' AND status = '未架電';
-- TM3897: 推測ロジック適用 (直近架電日(2025-04-25)が存在 → 必ず架電している, 対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 2, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3897' AND status = '未架電';
-- TM3901: 推測ロジック適用 (対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3901' AND status = '未架電';
-- TM3915: 推測ロジック適用 (対応不可/失注理由(営業やめて)が存在 → 通電している可能性が極めて高い, ISステータス(失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3915' AND status = '未架電';
-- TM3931: 推測ロジック適用 (直近架電日(2025-05-02)が存在 → 必ず架電している, 会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3931' AND status = '未架電';
-- TM3945: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(税理士契約済)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3945' AND status = '未架電';
-- TM3996: 推測ロジック適用 (結果/コンタクト状況(未通電)が存在, 担当IS(小林)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET result_contact_status = '未通電', call_count = 1, staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3996' AND status = '未架電';
-- TM3999: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(谷口)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '谷口', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3999' AND status = '未架電';
-- TM4109: 推測ロジック適用 (直近架電日(2025-05-20)が存在 → 必ず架電している, 対応不可/失注理由(1. 完全未通電)が存在 → 通電している可能性が極めて高い, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-05-20', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4109' AND status = '未架電';
-- TM4113: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(税理士契約済)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4113' AND status = '未架電';
-- TM4116: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(谷口)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '谷口', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4116' AND status = '未架電';
-- TM4149: 推測ロジック適用 (ISステータス(架電対象外)が存在, 担当IS(小林)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '架電対象外', call_count = 1, staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4149' AND status = '未架電';
-- TM4150: 推測ロジック適用 (対応不可/失注理由(他社契約)が存在 → 通電している可能性が極めて高い, ISステータス(失注)が存在, 担当IS(小林)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4150' AND status = '未架電';
-- TM4153: 推測ロジック適用 (対応不可/失注理由(7. 対応不可：問い合せしていない)が存在 → 通電している可能性が極めて高い, ISステータス(失注)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4153' AND status = '未架電';
-- TM4154: 推測ロジック適用 (直近架電日(2025-05-02)が存在 → 必ず架電している, 会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4154' AND status = '未架電';
-- TM4156: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(谷口)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '谷口', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4156' AND status = '未架電';
-- TM4171: 推測ロジック適用 (直近架電日(2025-05-02)が存在 → 必ず架電している, 会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(21. FS：青色申告会/商工会)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4171' AND status = '未架電';
-- TM4175: 推測ロジック適用 (直近架電日(2025-05-02)が存在 → 必ず架電している, 会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(16. FS：税理士を探していない)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4175' AND status = '未架電';
-- TM4185: 推測ロジック適用 (直近架電日(2025-05-02)が存在 → 必ず架電している, 対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4185' AND status = '未架電';
-- TM4227: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(26. FS：その他)が存在 → 通電している可能性が極めて高い, ISステータス(04.失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4227' AND status = '未架電';
-- TM4261: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(07.既存顧客)が存在, 担当IS(平澤)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '07.既存顧客', result_contact_status = '通電', call_count = 1, staff_is = '平澤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4261' AND status = '未架電';
-- TM4266: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(平澤)が存在)（未架電→架電済に修正、連携日: (空)）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '平澤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4266' AND status = '未架電';
-- TM3592: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(04.失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-01-05）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3592' AND status = '未架電';
-- TM3593: 推測ロジック適用 (対応不可/失注理由(12.トスミス：詳細記載)が存在 → 通電している可能性が極めて高い, ISステータス(失注)が存在)（未架電→架電済に修正、連携日: 2024-01-05）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3593' AND status = '未架電';
-- TM3597: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-01-08）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3597' AND status = '未架電';
-- TM3598: 推測ロジック適用 (対応不可/失注理由(10.対応不可：風営法)が存在 → 通電している可能性が極めて高い, ISステータス(失注)が存在)（未架電→架電済に修正、連携日: 2024-01-08）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3598' AND status = '未架電';
-- TM3602: 推測ロジック適用 (直近架電日(2025-04-30)が存在 → 必ず架電している, 対応不可/失注理由(26. FS：その他)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-01-09）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3602' AND status = '未架電';
-- TM3615: 推測ロジック適用 (対応不可/失注理由(26. FS：その他)が存在 → 通電している可能性が極めて高い, ISステータス(07.既存顧客)が存在)（未架電→架電済に修正、連携日: 2024-01-10）
UPDATE call_records SET status_is = '07.既存顧客', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3615' AND status = '未架電';
-- TM3616: 推測ロジック適用 (ISステータス(07.既存顧客)が存在)（未架電→架電済に修正、連携日: 2024-01-10）
UPDATE call_records SET status_is = '07.既存顧客', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3616' AND status = '未架電';
-- TM3617: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(谷口)が存在)（未架電→架電済に修正、連携日: 2024-01-10）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '谷口', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3617' AND status = '未架電';
-- TM3619: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-01-11）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3619' AND status = '未架電';
-- TM3623: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-01-12）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3623' AND status = '未架電';
-- TM3626: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(1.完全未通電)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-01-15）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3626' AND status = '未架電';
-- TM3639: 推測ロジック適用 (直近架電日(2025-04-30)が存在 → 必ず架電している, 対応不可/失注理由(4. IS：日本語不可)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-01-16）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3639' AND status = '未架電';
-- TM3642: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(谷口)が存在)（未架電→架電済に修正、連携日: 2024-01-16）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '谷口', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3642' AND status = '未架電';
-- TM3648: 推測ロジック適用 (直近架電日(2025-04-25)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-01-17）
UPDATE call_records SET result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3648' AND status = '未架電';
-- TM3652: 推測ロジック適用 (直近架電日(2025-04-15)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-01-18）
UPDATE call_records SET result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-15', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3652' AND status = '未架電';
-- TM3655: 推測ロジック適用 (対応不可/失注理由(23. FS：対面税理士)が存在 → 通電している可能性が極めて高い, ISステータス(失注)が存在)（未架電→架電済に修正、連携日: 2024-01-18）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3655' AND status = '未架電';
-- TM3658: 推測ロジック適用 (直近架電日(2025-04-30)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-01-19）
UPDATE call_records SET result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3658' AND status = '未架電';
-- TM3659: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(谷口)が存在)（未架電→架電済に修正、連携日: 2024-01-19）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '谷口', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3659' AND status = '未架電';
-- TM3662: 推測ロジック適用 (対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, ISステータス(失注)が存在)（未架電→架電済に修正、連携日: 2024-01-22）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3662' AND status = '未架電';
-- TM3664: 推測ロジック適用 (ISステータス(07.既存顧客)が存在)（未架電→架電済に修正、連携日: 2024-01-22）
UPDATE call_records SET status_is = '07.既存顧客', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3664' AND status = '未架電';
-- TM3668: 推測ロジック適用 (直近架電日(2025-04-25)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-01-23）
UPDATE call_records SET result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3668' AND status = '未架電';
-- TM3670: 推測ロジック適用 (直近架電日(2025-04-25)が存在 → 必ず架電している, 対応不可/失注理由(4. IS：日本語不可)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-01-23）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3670' AND status = '未架電';
-- TM3674: 推測ロジック適用 (対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い)（未架電→架電済に修正、連携日: 2024-01-24）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3674' AND status = '未架電';
-- TM3682: 推測ロジック適用 (対応不可/失注理由(12.トスミス：詳細記載)が存在 → 通電している可能性が極めて高い, ISステータス(失注)が存在)（未架電→架電済に修正、連携日: 2024-01-26）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3682' AND status = '未架電';
-- TM3683: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(谷口)が存在)（未架電→架電済に修正、連携日: 2024-01-29）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '谷口', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3683' AND status = '未架電';
-- TM3698: 推測ロジック適用 (ISステータス(07.既存顧客)が存在)（未架電→架電済に修正、連携日: 2024-01-29）
UPDATE call_records SET status_is = '07.既存顧客', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3698' AND status = '未架電';
-- TM3699: 推測ロジック適用 (直近架電日(2025-04-25)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-01-29）
UPDATE call_records SET result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3699' AND status = '未架電';
-- TM3704: 推測ロジック適用 (直近架電日(2025-04-25)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-01-29）
UPDATE call_records SET result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3704' AND status = '未架電';
-- TM3692: 推測ロジック適用 (対応不可/失注理由(12.トスミス：詳細記載)が存在 → 通電している可能性が極めて高い)（未架電→架電済に修正、連携日: 2024-01-30）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3692' AND status = '未架電';
-- TM3703: 推測ロジック適用 (対応不可/失注理由(忙しいので連絡しないでほしい)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-01-31）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3703' AND status = '未架電';
-- TM3708: 推測ロジック適用 (対応不可/失注理由(12.トスミス：詳細記載)が存在 → 通電している可能性が極めて高い, ISステータス(07.既存顧客)が存在)（未架電→架電済に修正、連携日: 2024-02-02）
UPDATE call_records SET status_is = '07.既存顧客', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3708' AND status = '未架電';
-- TM3710: 推測ロジック適用 (対応不可/失注理由(11.対応不可：その他（対応不可理由）)が存在 → 通電している可能性が極めて高い)（未架電→架電済に修正、連携日: 2024-02-05）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3710' AND status = '未架電';
-- TM3712: 推測ロジック適用 (対応不可/失注理由(12.トスミス：詳細記載)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-02-05）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3712' AND status = '未架電';
-- TM3715: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(自己対応)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-02-05）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3715' AND status = '未架電';
-- TM3718: 推測ロジック適用 (直近架電日(2025-04-30)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-02-05）
UPDATE call_records SET result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3718' AND status = '未架電';
-- TM3721: 推測ロジック適用 (直近架電日(2025-04-30)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-02-06）
UPDATE call_records SET result_contact_status = '不通', call_count = 2, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3721' AND status = '未架電';
-- TM3726: 推測ロジック適用 (ISステータス(07.既存顧客)が存在)（未架電→架電済に修正、連携日: 2024-02-07）
UPDATE call_records SET status_is = '07.既存顧客', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3726' AND status = '未架電';
-- TM3727: 推測ロジック適用 (ISステータス(07.既存顧客)が存在)（未架電→架電済に修正、連携日: 2024-02-07）
UPDATE call_records SET status_is = '07.既存顧客', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3727' AND status = '未架電';
-- TM3729: 推測ロジック適用 (直近架電日(2025-04-25)が存在 → 必ず架電している, 対応不可/失注理由(4. IS：日本語不可)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-02-07）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3729' AND status = '未架電';
-- TM3736: 推測ロジック適用 (ISステータス(07.既存顧客)が存在)（未架電→架電済に修正、連携日: 2024-02-09）
UPDATE call_records SET status_is = '07.既存顧客', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3736' AND status = '未架電';
-- TM3737: 推測ロジック適用 (直近架電日(2025-04-25)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-02-09）
UPDATE call_records SET result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3737' AND status = '未架電';
-- TM3738: 推測ロジック適用 (対応不可/失注理由(12.トスミス：詳細記載)が存在 → 通電している可能性が極めて高い, ISステータス(07.既存顧客)が存在)（未架電→架電済に修正、連携日: 2024-02-12）
UPDATE call_records SET status_is = '07.既存顧客', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3738' AND status = '未架電';
-- TM3744: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(谷口)が存在)（未架電→架電済に修正、連携日: 2024-02-13）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '谷口', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3744' AND status = '未架電';
-- TM3746: 推測ロジック適用 (対応不可/失注理由(4. IS：日本語不可)が存在 → 通電している可能性が極めて高い, ISステータス(07.既存顧客)が存在)（未架電→架電済に修正、連携日: 2024-02-14）
UPDATE call_records SET status_is = '07.既存顧客', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3746' AND status = '未架電';
-- TM3747: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(税理士契約済)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-02-14）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3747' AND status = '未架電';
-- TM3749: 推測ロジック適用 (直近架電日(2025-05-01)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-02-14）
UPDATE call_records SET result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3749' AND status = '未架電';
-- TM3750: 推測ロジック適用 (対応不可/失注理由(1. 完全未通電)が存在 → 通電している可能性が極めて高い, ISステータス(07.既存顧客)が存在)（未架電→架電済に修正、連携日: 2024-02-14）
UPDATE call_records SET status_is = '07.既存顧客', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3750' AND status = '未架電';
-- TM3756: 推測ロジック適用 (直近架電日(2025-04-25)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-02-15）
UPDATE call_records SET result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3756' AND status = '未架電';
-- TM3763: 推測ロジック適用 (直近架電日(2025-04-25)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-02-19）
UPDATE call_records SET result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3763' AND status = '未架電';
-- TM3773: 推測ロジック適用 (ISステータス(07.既存顧客)が存在)（未架電→架電済に修正、連携日: 2024-02-20）
UPDATE call_records SET status_is = '07.既存顧客', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3773' AND status = '未架電';
-- TM3774: 推測ロジック適用 (対応不可/失注理由(22. FS：紹介税理士)が存在 → 通電している可能性が極めて高い)（未架電→架電済に修正、連携日: 2024-02-21）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3774' AND status = '未架電';
-- TM3778: 推測ロジック適用 (対応不可/失注理由(12.トスミス：詳細記載)が存在 → 通電している可能性が極めて高い)（未架電→架電済に修正、連携日: 2024-02-21）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3778' AND status = '未架電';
-- TM3787: 推測ロジック適用 (直近架電日(2025-04-25)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-02-22）
UPDATE call_records SET result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3787' AND status = '未架電';
-- TM3794: 推測ロジック適用 (対応不可/失注理由(12.トスミス：詳細記載)が存在 → 通電している可能性が極めて高い)（未架電→架電済に修正、連携日: 2024-02-26）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3794' AND status = '未架電';
-- TM3796: 推測ロジック適用 (対応不可/失注理由(税理士契約済)が存在 → 通電している可能性が極めて高い, ISステータス(90. 失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-02-26）
UPDATE call_records SET status_is = '90. 失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3796' AND status = '未架電';
-- TM3804: 推測ロジック適用 (対応不可/失注理由(12.トスミス：詳細記載)が存在 → 通電している可能性が極めて高い)（未架電→架電済に修正、連携日: 2024-02-27）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3804' AND status = '未架電';
-- TM3806: 推測ロジック適用 (直近架電日(2025-04-25)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-02-28）
UPDATE call_records SET result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3806' AND status = '未架電';
-- TM3809: 推測ロジック適用 (ISステータス(07.既存顧客)が存在)（未架電→架電済に修正、連携日: 2024-02-29）
UPDATE call_records SET status_is = '07.既存顧客', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3809' AND status = '未架電';
-- TM3811: 推測ロジック適用 (直近架電日(2025-04-25)が存在 → 必ず架電している, 対応不可/失注理由(4. IS：日本語不可)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-03-01）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3811' AND status = '未架電';
-- TM3812: 推測ロジック適用 (対応不可/失注理由(12.トスミス：詳細記載)が存在 → 通電している可能性が極めて高い)（未架電→架電済に修正、連携日: 2024-03-01）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3812' AND status = '未架電';
-- TM3826: 推測ロジック適用 (対応不可/失注理由(12.トスミス：詳細記載)が存在 → 通電している可能性が極めて高い)（未架電→架電済に修正、連携日: 2024-03-08）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3826' AND status = '未架電';
-- TM3832: 推測ロジック適用 (対応不可/失注理由(17. FS：話だけ聞きにきた)が存在 → 通電している可能性が極めて高い)（未架電→架電済に修正、連携日: 2024-03-12）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3832' AND status = '未架電';
-- TM3833: 推測ロジック適用 (対応不可/失注理由(17. FS：話だけ聞きにきた)が存在 → 通電している可能性が極めて高い)（未架電→架電済に修正、連携日: 2024-03-12）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3833' AND status = '未架電';
-- TM3834: 推測ロジック適用 (対応不可/失注理由(19. FS：価格不満足)が存在 → 通電している可能性が極めて高い, ISステータス(07.既存顧客)が存在)（未架電→架電済に修正、連携日: 2024-03-12）
UPDATE call_records SET status_is = '07.既存顧客', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3834' AND status = '未架電';
-- TM3837: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(畠中)が存在)（未架電→架電済に修正、連携日: 2024-03-12）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '畠中', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3837' AND status = '未架電';
-- TM3842: 推測ロジック適用 (対応不可/失注理由(12.トスミス：詳細記載)が存在 → 通電している可能性が極めて高い, ISステータス(失注)が存在)（未架電→架電済に修正、連携日: 2024-03-13）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3842' AND status = '未架電';
-- TM3843: 推測ロジック適用 (対応不可/失注理由(11.対応不可：その他（対応不可理由）)が存在 → 通電している可能性が極めて高い, ISステータス(失注)が存在)（未架電→架電済に修正、連携日: 2024-03-13）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3843' AND status = '未架電';
-- TM3848: 推測ロジック適用 (対応不可/失注理由(11.対応不可：その他（対応不可理由）)が存在 → 通電している可能性が極めて高い, ISステータス(失注)が存在)（未架電→架電済に修正、連携日: 2024-03-15）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3848' AND status = '未架電';
-- TM3851: 推測ロジック適用 (対応不可/失注理由(12.トスミス：詳細記載)が存在 → 通電している可能性が極めて高い, ISステータス(失注)が存在)（未架電→架電済に修正、連携日: 2024-03-18）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3851' AND status = '未架電';
-- TM3858: 推測ロジック適用 (対応不可/失注理由(26. FS：その他)が存在 → 通電している可能性が極めて高い)（未架電→架電済に修正、連携日: 2024-03-19）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3858' AND status = '未架電';
-- TM3864: 推測ロジック適用 (ISステータス(07.既存顧客)が存在)（未架電→架電済に修正、連携日: 2024-03-22）
UPDATE call_records SET status_is = '07.既存顧客', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3864' AND status = '未架電';
-- TM3865: 推測ロジック適用 (直近架電日(2025-04-25)が存在 → 必ず架電している, 対応不可/失注理由(4. IS：日本語不可)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-03-22）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 2, last_called_date = '2025-04-25', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3865' AND status = '未架電';
-- TM3866: 推測ロジック適用 (対応不可/失注理由(11.対応不可：その他（対応不可理由）)が存在 → 通電している可能性が極めて高い, ISステータス(失注)が存在)（未架電→架電済に修正、連携日: 2024-03-22）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3866' AND status = '未架電';
-- TM3867: 推測ロジック適用 (対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い)（未架電→架電済に修正、連携日: 2024-03-22）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3867' AND status = '未架電';
-- TM3868: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(畠中)が存在)（未架電→架電済に修正、連携日: 2024-03-22）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '畠中', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3868' AND status = '未架電';
-- TM3869: 推測ロジック適用 (対応不可/失注理由(番号ミス)が存在 → 通電している可能性が極めて高い, ISステータス(失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-03-22）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3869' AND status = '未架電';
-- TM3870: 推測ロジック適用 (ISステータス(07.既存顧客)が存在)（未架電→架電済に修正、連携日: 2024-03-25）
UPDATE call_records SET status_is = '07.既存顧客', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3870' AND status = '未架電';
-- TM3873: 推測ロジック適用 (直近架電日(2025-05-02)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-03-25）
UPDATE call_records SET result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3873' AND status = '未架電';
-- TM3876: 推測ロジック適用 (対応不可/失注理由(10.対応不可：風営法)が存在 → 通電している可能性が極めて高い)（未架電→架電済に修正、連携日: 2024-03-26）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3876' AND status = '未架電';
-- TM3879: 推測ロジック適用 (直近架電日(2025-05-02)が存在 → 必ず架電している, 対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-03-28）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3879' AND status = '未架電';
-- TM3880: 推測ロジック適用 (対応不可/失注理由(8. 対応不可：ガチャ切り)が存在 → 通電している可能性が極めて高い, ISステータス(失注)が存在)（未架電→架電済に修正、連携日: 2024-03-28）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3880' AND status = '未架電';
-- TM3881: 推測ロジック適用 (対応不可/失注理由(12.トスミス：詳細記載)が存在 → 通電している可能性が極めて高い, ISステータス(失注)が存在)（未架電→架電済に修正、連携日: 2024-03-29）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3881' AND status = '未架電';
-- TM3883: 推測ロジック適用 (直近架電日(2025-04-23)が存在 → 必ず架電している, 対応不可/失注理由(1. 完全未通電)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-04-01）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-23', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3883' AND status = '未架電';
-- TM3884: 推測ロジック適用 (直近架電日(2025-05-02)が存在 → 必ず架電している, 会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(3. IS：自己対応)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-04-02）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3884' AND status = '未架電';
-- TM3891: 推測ロジック適用 (直近架電日(2025-05-02)が存在 → 必ず架電している, 対応不可/失注理由(3. IS：自己対応)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-04-05）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3891' AND status = '未架電';
-- TM3893: 推測ロジック適用 (直近架電日(2025-05-02)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-04-08）
UPDATE call_records SET result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3893' AND status = '未架電';
-- TM3903: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-04-10）
UPDATE call_records SET result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3903' AND status = '未架電';
-- TM3905: 推測ロジック適用 (対応不可/失注理由(12.トスミス：詳細記載)が存在 → 通電している可能性が極めて高い, ISステータス(失注)が存在)（未架電→架電済に修正、連携日: 2024-04-10）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3905' AND status = '未架電';
-- TM3911: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 対応不可/失注理由(12.トスミス：詳細記載)が存在 → 通電している可能性が極めて高い, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-04-12）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3911' AND status = '未架電';
-- TM3912: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 対応不可/失注理由(6. IS：オンライン対応不可)が存在 → 通電している可能性が極めて高い, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-04-15）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3912' AND status = '未架電';
-- TM3914: 推測ロジック適用 (直近架電日(2025-05-02)が存在 → 必ず架電している, 対応不可/失注理由(1. 完全未通電)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-04-15）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3914' AND status = '未架電';
-- TM3917: 推測ロジック適用 (直近架電日(2025-05-02)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-04-15）
UPDATE call_records SET result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3917' AND status = '未架電';
-- TM3918: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 対応不可/失注理由(1. 完全未通電)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-04-15）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3918' AND status = '未架電';
-- TM3920: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-04-16）
UPDATE call_records SET result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3920' AND status = '未架電';
-- TM3921: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-04-16）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3921' AND status = '未架電';
-- TM3922: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 対応不可/失注理由(4. IS：日本語不可)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-04-17）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3922' AND status = '未架電';
-- TM3923: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 対応不可/失注理由(4. IS：日本語不可)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-04-17）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3923' AND status = '未架電';
-- TM3924: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-04-17）
UPDATE call_records SET result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3924' AND status = '未架電';
-- TM3925: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 対応不可/失注理由(3. IS：自己対応)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-04-18）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3925' AND status = '未架電';
-- TM3926: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-04-18）
UPDATE call_records SET result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3926' AND status = '未架電';
-- TM3927: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-04-18）
UPDATE call_records SET result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3927' AND status = '未架電';
-- TM3928: 推測ロジック適用 (直近架電日(2025-04-28)が存在 → 必ず架電している, 対応不可/失注理由(18. FS：サービス内容不満足)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(通電)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-04-18）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-28', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3928' AND status = '未架電';
-- TM3929: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(08.掛け直し（通電・アポ前）)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-04-19）
UPDATE call_records SET status_is = '08.掛け直し（通電・アポ前）', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3929' AND status = '未架電';
-- TM3930: 推測ロジック適用 (対応不可/失注理由(12.トスミス：詳細記載)が存在 → 通電している可能性が極めて高い, ISステータス(失注)が存在)（未架電→架電済に修正、連携日: 2024-04-22）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3930' AND status = '未架電';
-- TM3936: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-04-24）
UPDATE call_records SET result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3936' AND status = '未架電';
-- TM3937: 推測ロジック適用 (対応不可/失注理由(7. 対応不可：問い合せしていない)が存在 → 通電している可能性が極めて高い, ISステータス(失注)が存在)（未架電→架電済に修正、連携日: 2024-04-24）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3937' AND status = '未架電';
-- TM3940: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-04-25）
UPDATE call_records SET result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3940' AND status = '未架電';
-- TM3941: 推測ロジック適用 (直近架電日(2025-04-28)が存在 → 必ず架電している, 対応不可/失注理由(17. FS：話だけ聞きにきた)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-04-26）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-28', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3941' AND status = '未架電';
-- TM3942: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-04-29）
UPDATE call_records SET result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3942' AND status = '未架電';
-- TM3943: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(平澤)が存在)（未架電→架電済に修正、連携日: 2024-04-30）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '平澤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3943' AND status = '未架電';
-- TM3947: 推測ロジック適用 (対応不可/失注理由(12.トスミス：詳細記載)が存在 → 通電している可能性が極めて高い, ISステータス(失注)が存在)（未架電→架電済に修正、連携日: 2024-05-02）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3947' AND status = '未架電';
-- TM3951: 推測ロジック適用 (直近架電日(2025-04-28)が存在 → 必ず架電している, 対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-05-07）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-28', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3951' AND status = '未架電';
-- TM3954: 推測ロジック適用 (直近架電日(2025-04-28)が存在 → 必ず架電している, 対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-05-07）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-28', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3954' AND status = '未架電';
-- TM3955: 推測ロジック適用 (直近架電日(2025-04-30)が存在 → 必ず架電している, 対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(奥谷)が存在)（未架電→架電済に修正、連携日: 2024-05-07）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-30', staff_is = '奥谷', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3955' AND status = '未架電';
-- TM3956: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-05-07）
UPDATE call_records SET result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3956' AND status = '未架電';
-- TM3959: 推測ロジック適用 (対応不可/失注理由(11.対応不可：その他（対応不可理由）)が存在 → 通電している可能性が極めて高い)（未架電→架電済に修正、連携日: 2024-05-09）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3959' AND status = '未架電';
-- TM3960: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 対応不可/失注理由(6. IS：オンライン対応不可)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-05-09）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3960' AND status = '未架電';
-- TM3964: 推測ロジック適用 (直近架電日(2025-05-01)が存在 → 必ず架電している, 対応不可/失注理由(1. 完全未通電)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(奥谷)が存在)（未架電→架電済に修正、連携日: 2024-05-13）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-05-01', staff_is = '奥谷', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3964' AND status = '未架電';
-- TM3966: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-05-13）
UPDATE call_records SET result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3966' AND status = '未架電';
-- TM3968: 推測ロジック適用 (直近架電日(2025-05-12)が存在 → 必ず架電している, 対応不可/失注理由(3. IS：自己対応)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-05-14）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-12', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3968' AND status = '未架電';
-- TM3970: 推測ロジック適用 (直近架電日(2025-05-12)が存在 → 必ず架電している, 対応不可/失注理由(3. IS：自己対応)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-05-14）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-12', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3970' AND status = '未架電';
-- TM3972: 推測ロジック適用 (直近架電日(2025-05-01)が存在 → 必ず架電している, 対応不可/失注理由(1. 完全未通電)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(奥谷)が存在)（未架電→架電済に修正、連携日: 2024-05-15）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-05-01', staff_is = '奥谷', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3972' AND status = '未架電';
-- TM3975: 推測ロジック適用 (直近架電日(2025-05-01)が存在 → 必ず架電している, 対応不可/失注理由(1. 完全未通電)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(奥谷)が存在)（未架電→架電済に修正、連携日: 2024-05-16）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-05-01', staff_is = '奥谷', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3975' AND status = '未架電';
-- TM3976: 推測ロジック適用 (対応不可/失注理由(閉業)が存在 → 通電している可能性が極めて高い, ISステータス(失注)が存在)（未架電→架電済に修正、連携日: 2024-05-16）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3976' AND status = '未架電';
-- TM3978: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 対応不可/失注理由(8. 対応不可：ガチャ切り)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-05-16）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3978' AND status = '未架電';
-- TM3979: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-05-16）
UPDATE call_records SET result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3979' AND status = '未架電';
-- TM3981: 推測ロジック適用 (対応不可/失注理由(1. 完全未通電)が存在 → 通電している可能性が極めて高い, 担当IS(小林)が存在)（未架電→架電済に修正、連携日: 2024-05-16）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3981' AND status = '未架電';
-- TM3982: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 対応不可/失注理由(1. 完全未通電)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-05-20）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3982' AND status = '未架電';
-- TM3984: 推測ロジック適用 (直近架電日(2025-05-12)が存在 → 必ず架電している, 対応不可/失注理由(3. IS：自己対応)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-05-21）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-12', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3984' AND status = '未架電';
-- TM3987: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 対応不可/失注理由(1. 完全未通電)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-05-23）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3987' AND status = '未架電';
-- TM3988: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 対応不可/失注理由(6. IS：オンライン対応不可)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-05-24）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3988' AND status = '未架電';
-- TM3989: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 対応不可/失注理由(1. 完全未通電)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-05-24）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3989' AND status = '未架電';
-- TM3991: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-05-24）
UPDATE call_records SET result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3991' AND status = '未架電';
-- TM3992: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-05-24）
UPDATE call_records SET result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3992' AND status = '未架電';
-- TM3993: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(平澤)が存在)（未架電→架電済に修正、連携日: 2024-05-27）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '平澤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3993' AND status = '未架電';
-- TM3995: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-05-27）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3995' AND status = '未架電';
-- TM3997: 推測ロジック適用 (対応不可/失注理由(12.トスミス：詳細記載)が存在 → 通電している可能性が極めて高い, ISステータス(失注)が存在)（未架電→架電済に修正、連携日: 2024-05-27）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM3997' AND status = '未架電';
-- TM4000: 推測ロジック適用 (対応不可/失注理由(11.対応不可：その他（対応不可理由）)が存在 → 通電している可能性が極めて高い, ISステータス(失注)が存在)（未架電→架電済に修正、連携日: 2024-05-28）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4000' AND status = '未架電';
-- TM4002: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-05-29）
UPDATE call_records SET result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4002' AND status = '未架電';
-- TM4003: 推測ロジック適用 (担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-05-30）
UPDATE call_records SET call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4003' AND status = '未架電';
-- TM4004: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-05-30）
UPDATE call_records SET result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4004' AND status = '未架電';
-- TM4007: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-06-03）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4007' AND status = '未架電';
-- TM4010: 推測ロジック適用 (担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-06-04）
UPDATE call_records SET call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4010' AND status = '未架電';
-- TM4013: 推測ロジック適用 (直近架電日(2025-05-01)が存在 → 必ず架電している, 会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(通電)が存在, 担当IS(奥谷)が存在)（未架電→架電済に修正、連携日: 2024-06-05）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-05-01', staff_is = '奥谷', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4013' AND status = '未架電';
-- TM4014: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(奥谷)が存在)（未架電→架電済に修正、連携日: 2024-06-05）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '奥谷', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4014' AND status = '未架電';
-- TM4015: 推測ロジック適用 (直近架電日(2025-05-01)が存在 → 必ず架電している, 会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(通電)が存在, 担当IS(奥谷)が存在)（未架電→架電済に修正、連携日: 2024-06-05）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-05-01', staff_is = '奥谷', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4015' AND status = '未架電';
-- TM4016: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(奥谷)が存在)（未架電→架電済に修正、連携日: 2024-06-06）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '奥谷', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4016' AND status = '未架電';
-- TM4017: 推測ロジック適用 (直近架電日(2025-05-01)が存在 → 必ず架電している, 会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(奥谷)が存在)（未架電→架電済に修正、連携日: 2024-06-06）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-05-01', staff_is = '奥谷', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4017' AND status = '未架電';
-- TM4018: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 対応不可/失注理由(1. 完全未通電)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(奥谷)が存在)（未架電→架電済に修正、連携日: 2024-06-07）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '奥谷', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4018' AND status = '未架電';
-- TM4019: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(奥谷)が存在)（未架電→架電済に修正、連携日: 2024-06-10）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '奥谷', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4019' AND status = '未架電';
-- TM4021: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(奥谷)が存在)（未架電→架電済に修正、連携日: 2024-06-10）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '奥谷', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4021' AND status = '未架電';
-- TM4023: 推測ロジック適用 (直近架電日(2025-05-01)が存在 → 必ず架電している, 対応不可/失注理由(3. IS：自己対応)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(通電)が存在, 担当IS(奥谷)が存在)（未架電→架電済に修正、連携日: 2024-06-10）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-05-01', staff_is = '奥谷', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4023' AND status = '未架電';
-- TM4025: 推測ロジック適用 (直近架電日(2025-05-01)が存在 → 必ず架電している, 対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(通電)が存在, 担当IS(奥谷)が存在)（未架電→架電済に修正、連携日: 2024-06-11）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-05-01', staff_is = '奥谷', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4025' AND status = '未架電';
-- TM4026: 推測ロジック適用 (直近架電日(2025-05-01)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(奥谷)が存在)（未架電→架電済に修正、連携日: 2024-06-12）
UPDATE call_records SET result_contact_status = '不通', call_count = 1, last_called_date = '2025-05-01', staff_is = '奥谷', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4026' AND status = '未架電';
-- TM4027: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 対応不可/失注理由(8. 対応不可：ガチャ切り)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(奥谷)が存在)（未架電→架電済に修正、連携日: 2024-06-12）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '奥谷', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4027' AND status = '未架電';
-- TM4032: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(失注)が存在, 担当IS(谷口)が存在)（未架電→架電済に修正、連携日: 2024-06-13）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, staff_is = '谷口', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4032' AND status = '未架電';
-- TM4033: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 対応不可/失注理由(19. FS：価格不満足)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-06-14）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4033' AND status = '未架電';
-- TM4037: 推測ロジック適用 (担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-06-17）
UPDATE call_records SET call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4037' AND status = '未架電';
-- TM4038: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(谷口)が存在)（未架電→架電済に修正、連携日: 2024-06-17）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '谷口', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4038' AND status = '未架電';
-- TM4039: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 対応不可/失注理由(1. 完全未通電)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-06-18）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4039' AND status = '未架電';
-- TM4040: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-06-18）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4040' AND status = '未架電';
-- TM4046: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-06-20）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4046' AND status = '未架電';
-- TM4048: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(谷口)が存在)（未架電→架電済に修正、連携日: 2024-06-20）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '谷口', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4048' AND status = '未架電';
-- TM4052: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-06-21）
UPDATE call_records SET result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4052' AND status = '未架電';
-- TM4054: 推測ロジック適用 (直近架電日(2025-04-30)が存在 → 必ず架電している, 会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(5. IS：価格不可)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-06-21）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4054' AND status = '未架電';
-- TM4056: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-06-24）
UPDATE call_records SET result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4056' AND status = '未架電';
-- TM4057: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(谷口)が存在)（未架電→架電済に修正、連携日: 2024-06-24）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '谷口', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4057' AND status = '未架電';
-- TM4058: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 対応不可/失注理由(4. IS：日本語不可)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-06-24）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4058' AND status = '未架電';
-- TM4060: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(谷口)が存在)（未架電→架電済に修正、連携日: 2024-06-24）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '谷口', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4060' AND status = '未架電';
-- TM4064: 推測ロジック適用 (直近架電日(2025-05-01)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-06-25）
UPDATE call_records SET result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4064' AND status = '未架電';
-- TM4065: 推測ロジック適用 (直近架電日(2025-05-01)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-06-25）
UPDATE call_records SET result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4065' AND status = '未架電';
-- TM4068: 推測ロジック適用 (直近架電日(2025-05-01)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-06-27）
UPDATE call_records SET result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4068' AND status = '未架電';
-- TM4070: 推測ロジック適用 (直近架電日(2025-05-01)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-06-27）
UPDATE call_records SET result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-01', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4070' AND status = '未架電';
-- TM4071: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-06-27）
UPDATE call_records SET result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4071' AND status = '未架電';
-- TM4075: 推測ロジック適用 (直近架電日(2025-04-22)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-07-01）
UPDATE call_records SET result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-22', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4075' AND status = '未架電';
-- TM4077: 推測ロジック適用 (直近架電日(2025-04-30)が存在 → 必ず架電している, 会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(18. FS：サービス内容不満足)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(通電)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-07-02）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-30', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4077' AND status = '未架電';
-- TM4083: 推測ロジック適用 (対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, ISステータス(失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-07-03）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4083' AND status = '未架電';
-- TM4088: 推測ロジック適用 (直近架電日(2025-04-23)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-07-04）
UPDATE call_records SET result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-23', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4088' AND status = '未架電';
-- TM4089: 推測ロジック適用 (直近架電日(2025-04-23)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-07-04）
UPDATE call_records SET result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-23', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4089' AND status = '未架電';
-- TM4090: 推測ロジック適用 (直近架電日(2025-04-24)が存在 → 必ず架電している, 対応不可/失注理由(4. IS：日本語不可)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(通電)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-07-04）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-24', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4090' AND status = '未架電';
-- TM4091: 推測ロジック適用 (対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, ISステータス(失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-07-05）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4091' AND status = '未架電';
-- TM4094: 推測ロジック適用 (直近架電日(2025-04-23)が存在 → 必ず架電している, 結果/コンタクト状況(通電)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-07-08）
UPDATE call_records SET result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-23', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4094' AND status = '未架電';
-- TM4095: 推測ロジック適用 (対応不可/失注理由(19. FS：価格不満足)が存在 → 通電している可能性が極めて高い, ISステータス(失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-07-08）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4095' AND status = '未架電';
-- TM4098: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(谷口)が存在)（未架電→架電済に修正、連携日: 2024-07-08）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '谷口', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4098' AND status = '未架電';
-- TM4099: 推測ロジック適用 (直近架電日(2025-04-23)が存在 → 必ず架電している, 対応不可/失注理由(1. 完全未通電)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-07-08）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-23', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4099' AND status = '未架電';
-- TM4102: 推測ロジック適用 (直近架電日(2025-05-02)が存在 → 必ず架電している, 対応不可/失注理由(1. 完全未通電)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-07-09）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4102' AND status = '未架電';
-- TM4105: 推測ロジック適用 (直近架電日(2025-04-23)が存在 → 必ず架電している, 対応不可/失注理由(4. IS：日本語不可)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(通電)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-07-10）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 2, last_called_date = '2025-04-23', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4105' AND status = '未架電';
-- TM4107: 推測ロジック適用 (直近架電日(2025-05-02)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-07-10）
UPDATE call_records SET result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-02', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4107' AND status = '未架電';
-- TM4110: 推測ロジック適用 (対応不可/失注理由(19. FS：価格不満足)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-07-12）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4110' AND status = '未架電';
-- TM4111: 推測ロジック適用 (ISステータス(07.既存顧客)が存在)（未架電→架電済に修正、連携日: 2024-07-12）
UPDATE call_records SET status_is = '07.既存顧客', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4111' AND status = '未架電';
-- TM4112: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(谷口)が存在)（未架電→架電済に修正、連携日: 2024-07-15）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '谷口', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4112' AND status = '未架電';
-- TM4114: 推測ロジック適用 (対応不可/失注理由(19. FS：価格不満足)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-07-16）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4114' AND status = '未架電';
-- TM4115: 推測ロジック適用 (対応不可/失注理由(16. FS：税理士を探していない)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-07-16）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4115' AND status = '未架電';
-- TM4117: 推測ロジック適用 (ISステータス(07.既存顧客)が存在)（未架電→架電済に修正、連携日: 2024-07-17）
UPDATE call_records SET status_is = '07.既存顧客', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4117' AND status = '未架電';
-- TM4118: 推測ロジック適用 (直近架電日(2025-04-23)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-07-17）
UPDATE call_records SET result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-23', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4118' AND status = '未架電';
-- TM4119: 推測ロジック適用 (ISステータス(07.既存顧客)が存在)（未架電→架電済に修正、連携日: 2024-07-17）
UPDATE call_records SET status_is = '07.既存顧客', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4119' AND status = '未架電';
-- TM4120: 推測ロジック適用 (対応不可/失注理由(25. FS：音信不通)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-07-17）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4120' AND status = '未架電';
-- TM4123: 推測ロジック適用 (直近架電日(2025-04-23)が存在 → 必ず架電している, 対応不可/失注理由(17. FS：話だけ聞きにきた)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(未通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-07-18）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '未通', call_count = 1, last_called_date = '2025-04-23', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4123' AND status = '未架電';
-- TM4125: 推測ロジック適用 (ISステータス(07.既存顧客)が存在)（未架電→架電済に修正、連携日: 2024-07-19）
UPDATE call_records SET status_is = '07.既存顧客', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4125' AND status = '未架電';
-- TM4126: 推測ロジック適用 (ISステータス(07.既存顧客)が存在)（未架電→架電済に修正、連携日: 2024-07-19）
UPDATE call_records SET status_is = '07.既存顧客', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4126' AND status = '未架電';
-- TM4129: 推測ロジック適用 (対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-07-22）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4129' AND status = '未架電';
-- TM4130: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(税理士契約済)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-07-22）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4130' AND status = '未架電';
-- TM4132: 推測ロジック適用 (直近架電日(2025-04-23)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-07-22）
UPDATE call_records SET result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-23', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4132' AND status = '未架電';
-- TM4133: 推測ロジック適用 (直近架電日(2025-04-23)が存在 → 必ず架電している, 会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(6. IS：オンライン対応不可)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(通電)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-07-22）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-23', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4133' AND status = '未架電';
-- TM4134: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(谷口)が存在)（未架電→架電済に修正、連携日: 2024-07-23）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '谷口', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4134' AND status = '未架電';
-- TM4136: 推測ロジック適用 (ISステータス(31.トスミス（重複）)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-07-23）
UPDATE call_records SET status_is = '31.トスミス（重複）', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4136' AND status = '未架電';
-- TM4138: 推測ロジック適用 (対応不可/失注理由(16. FS：税理士を探していない)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-07-24）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4138' AND status = '未架電';
-- TM4139: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(谷口)が存在)（未架電→架電済に修正、連携日: 2024-07-24）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '谷口', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4139' AND status = '未架電';
-- TM4140: 推測ロジック適用 (ISステータス(07.既存顧客)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-07-24）
UPDATE call_records SET status_is = '07.既存顧客', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4140' AND status = '未架電';
-- TM4145: 推測ロジック適用 (直近架電日(2025-04-23)が存在 → 必ず架電している, 結果/コンタクト状況(通電)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-07-29）
UPDATE call_records SET result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-23', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4145' AND status = '未架電';
-- TM4146: 推測ロジック適用 (直近架電日(2025-04-23)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-07-29）
UPDATE call_records SET result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-23', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4146' AND status = '未架電';
-- TM4148: 推測ロジック適用 (ISステータス(07.既存顧客)が存在)（未架電→架電済に修正、連携日: 2024-07-30）
UPDATE call_records SET status_is = '07.既存顧客', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4148' AND status = '未架電';
-- TM4152: 推測ロジック適用 (対応不可/失注理由(10.対応不可：風営法)が存在 → 通電している可能性が極めて高い, ISステータス(失注)が存在)（未架電→架電済に修正、連携日: 2024-08-01）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4152' AND status = '未架電';
-- TM4159: 推測ロジック適用 (直近架電日(2025-04-23)が存在 → 必ず架電している, 対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-08-05）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-23', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4159' AND status = '未架電';
-- TM4161: 推測ロジック適用 (直近架電日(2025-04-23)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-08-05）
UPDATE call_records SET result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-23', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4161' AND status = '未架電';
-- TM4162: 推測ロジック適用 (対応不可/失注理由(25. FS：音信不通)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-08-05）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4162' AND status = '未架電';
-- TM4163: 推測ロジック適用 (直近架電日(2025-04-23)が存在 → 必ず架電している, 対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-08-06）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-23', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4163' AND status = '未架電';
-- TM4165: 推測ロジック適用 (対応不可/失注理由(5. IS：価格不可)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-08-07）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4165' AND status = '未架電';
-- TM4167: 推測ロジック適用 (対応不可/失注理由(8. 対応不可：ガチャ切り)が存在 → 通電している可能性が極めて高い, ISステータス(失注)が存在)（未架電→架電済に修正、連携日: 2024-08-07）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4167' AND status = '未架電';
-- TM4168: 推測ロジック適用 (直近架電日(2025-04-23)が存在 → 必ず架電している, 結果/コンタクト状況(通電)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-08-07）
UPDATE call_records SET result_contact_status = '通電', call_count = 1, last_called_date = '2025-04-23', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4168' AND status = '未架電';
-- TM4176: 推測ロジック適用 (直近架電日(2025-05-12)が存在 → 必ず架電している, 対応不可/失注理由(3. IS：自己対応)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-08-12）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-12', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4176' AND status = '未架電';
-- TM4177: 推測ロジック適用 (直近架電日(2025-05-12)が存在 → 必ず架電している, 対応不可/失注理由(3. IS：自己対応)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-08-19）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-12', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4177' AND status = '未架電';
-- TM4178: 推測ロジック適用 (直近架電日(2025-04-23)が存在 → 必ず架電している, 対応不可/失注理由(1. 完全未通電)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-08-19）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-23', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4178' AND status = '未架電';
-- TM4179: 推測ロジック適用 (直近架電日(2025-05-12)が存在 → 必ず架電している, 対応不可/失注理由(3. IS：自己対応)が存在 → 通電している可能性が極めて高い, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-08-19）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '不通', call_count = 2, last_called_date = '2025-05-12', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4179' AND status = '未架電';
-- TM4192: 推測ロジック適用 (対応不可/失注理由(19. FS：価格不満足)が存在 → 通電している可能性が極めて高い, ISステータス(04.失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-08-22）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4192' AND status = '未架電';
-- TM4195: 推測ロジック適用 (直近架電日(2025-04-23)が存在 → 必ず架電している, 結果/コンタクト状況(不通)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-08-27）
UPDATE call_records SET result_contact_status = '不通', call_count = 1, last_called_date = '2025-04-23', staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4195' AND status = '未架電';
-- TM4197: 推測ロジック適用 (担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-08-28）
UPDATE call_records SET call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4197' AND status = '未架電';
-- TM4201: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(谷口)が存在)（未架電→架電済に修正、連携日: 2024-08-28）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '谷口', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4201' AND status = '未架電';
-- TM4207: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(16. FS：税理士を探していない)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(谷口)が存在)（未架電→架電済に修正、連携日: 2024-09-03）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '谷口', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4207' AND status = '未架電';
-- TM4210: 推測ロジック適用 (ISステータス(31.トスミス（重複）)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-09-04）
UPDATE call_records SET status_is = '31.トスミス（重複）', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4210' AND status = '未架電';
-- TM4212: 推測ロジック適用 (対応不可/失注理由(1. 完全未通電)が存在 → 通電している可能性が極めて高い, ISステータス(06.未通電⑤)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-09-04）
UPDATE call_records SET status_is = '06.未通電⑤', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4212' AND status = '未架電';
-- TM4213: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(27. FS：契約中税理士継続利用)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(谷口)が存在)（未架電→架電済に修正、連携日: 2024-09-04）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '谷口', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4213' AND status = '未架電';
-- TM4214: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(19. FS：価格不満足)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-09-04）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4214' AND status = '未架電';
-- TM4215: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(6. IS：オンライン対応不可)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(谷口)が存在)（未架電→架電済に修正、連携日: 2024-09-04）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '谷口', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4215' AND status = '未架電';
-- TM4217: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(27. FS：契約中税理士継続利用)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(谷口)が存在)（未架電→架電済に修正、連携日: 2024-09-04）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '谷口', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4217' AND status = '未架電';
-- TM4221: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(16. FS：税理士を探していない)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(谷口)が存在)（未架電→架電済に修正、連携日: 2024-09-05）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '谷口', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4221' AND status = '未架電';
-- TM4223: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(税理士と契約済)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-09-06）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4223' AND status = '未架電';
-- TM4224: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(谷口)が存在)（未架電→架電済に修正、連携日: 2024-09-06）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '谷口', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4224' AND status = '未架電';
-- TM4228: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(07.既存顧客)が存在, 担当IS(平澤)が存在)（未架電→架電済に修正、連携日: 2024-09-09）
UPDATE call_records SET status_is = '07.既存顧客', result_contact_status = '通電', call_count = 1, staff_is = '平澤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4228' AND status = '未架電';
-- TM4237: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(07.既存顧客)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-09-09）
UPDATE call_records SET status_is = '07.既存顧客', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4237' AND status = '未架電';
-- TM4238: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(平澤)が存在)（未架電→架電済に修正、連携日: 2024-09-09）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '平澤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4238' AND status = '未架電';
-- TM4242: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(07.既存顧客)が存在, 担当IS(平澤)が存在)（未架電→架電済に修正、連携日: 2024-09-10）
UPDATE call_records SET status_is = '07.既存顧客', result_contact_status = '通電', call_count = 1, staff_is = '平澤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4242' AND status = '未架電';
-- TM4244: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(07.既存顧客)が存在, 担当IS(平澤)が存在)（未架電→架電済に修正、連携日: 2024-09-10）
UPDATE call_records SET status_is = '07.既存顧客', result_contact_status = '通電', call_count = 1, staff_is = '平澤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4244' AND status = '未架電';
-- TM4247: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(07.既存顧客)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-09-11）
UPDATE call_records SET status_is = '07.既存顧客', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4247' AND status = '未架電';
-- TM4249: 推測ロジック適用 (対応不可/失注理由(16. FS：税理士を探していない)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-09-11）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4249' AND status = '未架電';
-- TM4254: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(10.対応不可：風営法)が存在 → 通電している可能性が極めて高い, ISステータス(失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-09-13）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4254' AND status = '未架電';
-- TM4260: 推測ロジック適用 (ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-09-17）
UPDATE call_records SET status_is = '90.失注', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4260' AND status = '未架電';
-- TM4264: 推測ロジック適用 (ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-09-17）
UPDATE call_records SET status_is = '90.失注', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4264' AND status = '未架電';
-- TM4265: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(11.対応不可：その他（対応不可理由）)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(平澤)が存在)（未架電→架電済に修正、連携日: 2024-09-17）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '平澤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4265' AND status = '未架電';
-- TM4267: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-09-18）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4267' AND status = '未架電';
-- TM4270: 推測ロジック適用 (対応不可/失注理由(10.対応不可：風営法)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-09-19）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4270' AND status = '未架電';
-- TM4271: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(谷口)が存在)（未架電→架電済に修正、連携日: 2024-09-19）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '谷口', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4271' AND status = '未架電';
-- TM4276: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-09-19）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4276' AND status = '未架電';
-- TM4277: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(谷口)が存在)（未架電→架電済に修正、連携日: 2024-09-19）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '谷口', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4277' AND status = '未架電';
-- TM4281: 推測ロジック適用 (ISステータス(07.既存顧客)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-09-20）
UPDATE call_records SET status_is = '07.既存顧客', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4281' AND status = '未架電';
-- TM4283: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(谷口)が存在)（未架電→架電済に修正、連携日: 2024-09-24）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '谷口', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4283' AND status = '未架電';
-- TM4285: 推測ロジック適用 (対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-09-24）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4285' AND status = '未架電';
-- TM4287: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(07.既存顧客)が存在, 担当IS(平澤)が存在)（未架電→架電済に修正、連携日: 2024-09-24）
UPDATE call_records SET status_is = '07.既存顧客', result_contact_status = '通電', call_count = 1, staff_is = '平澤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4287' AND status = '未架電';
-- TM4293: 推測ロジック適用 (対応不可/失注理由(4. IS：日本語不可)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-09-26）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4293' AND status = '未架電';
-- TM4296: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(15. FS：弊社対応不可(理由記載))が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-09-26）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4296' AND status = '未架電';
-- TM4298: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(税理士契約済)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-09-27）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4298' AND status = '未架電';
-- TM4299: 推測ロジック適用 (対応不可/失注理由(3. IS：自己対応)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(平澤)が存在)（未架電→架電済に修正、連携日: 2024-09-27）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '平澤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4299' AND status = '未架電';
-- TM4300: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(06.完全未通電（架電5回以上、SMS反応なし）)が存在 → 通電している可能性が極めて高い, ISステータス(04.失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-09-27）
UPDATE call_records SET status_is = '04.失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4300' AND status = '未架電';
-- TM4302: 推測ロジック適用 (対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-09-30）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4302' AND status = '未架電';
-- TM4305: 推測ロジック適用 (ISステータス(07.既存顧客)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-09-30）
UPDATE call_records SET status_is = '07.既存顧客', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4305' AND status = '未架電';
-- TM4307: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(平澤)が存在)（未架電→架電済に修正、連携日: 2024-10-01）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '平澤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4307' AND status = '未架電';
-- TM4316: 推測ロジック適用 (ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-10-02）
UPDATE call_records SET status_is = '90.失注', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4316' AND status = '未架電';
-- TM4321: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(平澤)が存在)（未架電→架電済に修正、連携日: 2024-10-03）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '平澤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4321' AND status = '未架電';
-- TM4323: 推測ロジック適用 (対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(平澤)が存在)（未架電→架電済に修正、連携日: 2024-10-04）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '平澤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4323' AND status = '未架電';
-- TM4326: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(11.対応不可：その他（対応不可理由）)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-10-04）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4326' AND status = '未架電';
-- TM4327: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(07.既存顧客)が存在, 担当IS(平澤)が存在)（未架電→架電済に修正、連携日: 2024-10-07）
UPDATE call_records SET status_is = '07.既存顧客', result_contact_status = '通電', call_count = 1, staff_is = '平澤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4327' AND status = '未架電';
-- TM4328: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(19. FS：価格不満足)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-10-07）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4328' AND status = '未架電';
-- TM4330: 推測ロジック適用 (ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-10-07）
UPDATE call_records SET status_is = '90.失注', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4330' AND status = '未架電';
-- TM4333: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(平澤)が存在)（未架電→架電済に修正、連携日: 2024-10-08）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '平澤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4333' AND status = '未架電';
-- TM4334: 推測ロジック適用 (対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-10-08）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4334' AND status = '未架電';
-- TM4340: 推測ロジック適用 (対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-10-11）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4340' AND status = '未架電';
-- TM4341: 推測ロジック適用 (対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-10-11）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4341' AND status = '未架電';
-- TM4342: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(平澤)が存在)（未架電→架電済に修正、連携日: 2024-10-11）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '平澤', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4342' AND status = '未架電';
-- TM4344: 推測ロジック適用 (ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-10-11）
UPDATE call_records SET status_is = '90.失注', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4344' AND status = '未架電';
-- TM4345: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(07.既存顧客)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-10-15）
UPDATE call_records SET status_is = '07.既存顧客', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4345' AND status = '未架電';
-- TM4348: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(08.税理士契約済)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-10-15）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4348' AND status = '未架電';
-- TM4350: 推測ロジック適用 (対応不可/失注理由(6. IS：オンライン対応不可)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-10-15）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4350' AND status = '未架電';
-- TM4355: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-10-15）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4355' AND status = '未架電';
-- TM4357: 推測ロジック適用 (対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-10-16）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4357' AND status = '未架電';
-- TM4359: 推測ロジック適用 (ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-10-16）
UPDATE call_records SET status_is = '90.失注', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4359' AND status = '未架電';
-- TM4360: 推測ロジック適用 (ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-10-17）
UPDATE call_records SET status_is = '90.失注', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4360' AND status = '未架電';
-- TM4363: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(07.既存顧客)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-10-17）
UPDATE call_records SET status_is = '07.既存顧客', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4363' AND status = '未架電';
-- TM4366: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(19. FS：価格不満足)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-10-21）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4366' AND status = '未架電';
-- TM4380: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(10.対応不可：風営法)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-10-24）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4380' AND status = '未架電';
-- TM4385: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(07.既存顧客)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-10-26）
UPDATE call_records SET status_is = '07.既存顧客', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4385' AND status = '未架電';
-- TM4390: 推測ロジック適用 (ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-10-28）
UPDATE call_records SET status_is = '90.失注', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4390' AND status = '未架電';
-- TM4394: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-10-29）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4394' AND status = '未架電';
-- TM4396: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-10-30）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4396' AND status = '未架電';
-- TM4406: 推測ロジック適用 (対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-11-01）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4406' AND status = '未架電';
-- TM4407: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-11-04）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4407' AND status = '未架電';
-- TM4409: 推測ロジック適用 (対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-11-05）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4409' AND status = '未架電';
-- TM4410: 推測ロジック適用 (対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-11-05）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4410' AND status = '未架電';
-- TM4412: 推測ロジック適用 (対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-11-05）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4412' AND status = '未架電';
-- TM4421: 推測ロジック適用 (対応不可/失注理由(4. IS：日本語不可)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-11-08）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4421' AND status = '未架電';
-- TM4432: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(07.既存顧客)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-11-11）
UPDATE call_records SET status_is = '07.既存顧客', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4432' AND status = '未架電';
-- TM4436: 推測ロジック適用 (対応不可/失注理由(08.税理士契約済)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-11-12）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4436' AND status = '未架電';
-- TM4437: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-11-12）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4437' AND status = '未架電';
-- TM4438: 推測ロジック適用 (対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-11-12）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4438' AND status = '未架電';
-- TM4439: 推測ロジック適用 (対応不可/失注理由(08.税理士契約済)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-11-12）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4439' AND status = '未架電';
-- TM4440: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(08.税理士契約済)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-11-12）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4440' AND status = '未架電';
-- TM4441: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-11-13）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4441' AND status = '未架電';
-- TM4443: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(07.既存顧客)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-11-13）
UPDATE call_records SET status_is = '07.既存顧客', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4443' AND status = '未架電';
-- TM4446: 推測ロジック適用 (対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-11-14）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4446' AND status = '未架電';
-- TM4447: 推測ロジック適用 (対応不可/失注理由(自己対応)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-11-14）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4447' AND status = '未架電';
-- TM4448: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(3. IS：自己対応)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-11-14）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4448' AND status = '未架電';
-- TM4449: 推測ロジック適用 (対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-11-15）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4449' AND status = '未架電';
-- TM4451: 推測ロジック適用 (対応不可/失注理由(08.税理士契約済)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-11-15）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4451' AND status = '未架電';
-- TM4452: 推測ロジック適用 (担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-11-15）
UPDATE call_records SET call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4452' AND status = '未架電';
-- TM4454: 推測ロジック適用 (対応不可/失注理由(自己対応)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-11-18）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4454' AND status = '未架電';
-- TM4457: 推測ロジック適用 (ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-11-18）
UPDATE call_records SET status_is = '90.失注', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4457' AND status = '未架電';
-- TM4458: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(番号使われておらず)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-11-19）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4458' AND status = '未架電';
-- TM4462: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(07.既存顧客)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-11-19）
UPDATE call_records SET status_is = '07.既存顧客', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4462' AND status = '未架電';
-- TM4464: 推測ロジック適用 (対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-11-19）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4464' AND status = '未架電';
-- TM4465: 推測ロジック適用 (ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-11-20）
UPDATE call_records SET status_is = '90.失注', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4465' AND status = '未架電';
-- TM4466: 推測ロジック適用 (対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-11-20）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4466' AND status = '未架電';
-- TM4467: 推測ロジック適用 (ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-11-20）
UPDATE call_records SET status_is = '90.失注', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4467' AND status = '未架電';
-- TM4469: 推測ロジック適用 (対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-11-21）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4469' AND status = '未架電';
-- TM4474: 推測ロジック適用 (ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-11-21）
UPDATE call_records SET status_is = '90.失注', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4474' AND status = '未架電';
-- TM4478: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(07.既存顧客)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-11-22）
UPDATE call_records SET status_is = '07.既存顧客', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4478' AND status = '未架電';
-- TM4479: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-11-22）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4479' AND status = '未架電';
-- TM4480: 推測ロジック適用 (ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-11-23）
UPDATE call_records SET status_is = '90.失注', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4480' AND status = '未架電';
-- TM4485: 推測ロジック適用 (対応不可/失注理由(17. FS：話だけ聞きにきた)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-11-25）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4485' AND status = '未架電';
-- TM4489: 推測ロジック適用 (ISステータス(07.既存顧客)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-11-26）
UPDATE call_records SET status_is = '07.既存顧客', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4489' AND status = '未架電';
-- TM4492: 推測ロジック適用 (対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-11-28）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4492' AND status = '未架電';
-- TM4497: 推測ロジック適用 (ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-12-03）
UPDATE call_records SET status_is = '90.失注', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4497' AND status = '未架電';
-- TM4499: 推測ロジック適用 (ISステータス(07.既存顧客)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-12-04）
UPDATE call_records SET status_is = '07.既存顧客', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4499' AND status = '未架電';
-- TM4500: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-12-05）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4500' AND status = '未架電';
-- TM4501: 推測ロジック適用 (ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-12-05）
UPDATE call_records SET status_is = '90.失注', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4501' AND status = '未架電';
-- TM4502: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(16. FS：税理士を探していない)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-12-06）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4502' AND status = '未架電';
-- TM4503: 推測ロジック適用 (ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-12-08）
UPDATE call_records SET status_is = '90.失注', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4503' AND status = '未架電';
-- TM4504: 推測ロジック適用 (対応不可/失注理由(自己対応)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2024-12-09）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4504' AND status = '未架電';
-- TM4505: 推測ロジック適用 (ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-12-09）
UPDATE call_records SET status_is = '90.失注', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4505' AND status = '未架電';
-- TM4508: 推測ロジック適用 (対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-12-10）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4508' AND status = '未架電';
-- TM4509: 推測ロジック適用 (ISステータス(07.既存顧客)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-12-10）
UPDATE call_records SET status_is = '07.既存顧客', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4509' AND status = '未架電';
-- TM4512: 推測ロジック適用 (ISステータス(07.既存顧客)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-12-11）
UPDATE call_records SET status_is = '07.既存顧客', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4512' AND status = '未架電';
-- TM4513: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, 対応不可/失注理由(10.対応不可：風営法)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-12-12）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4513' AND status = '未架電';
-- TM4514: 推測ロジック適用 (対応不可/失注理由(16. FS：税理士を探していない)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-12-13）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4514' AND status = '未架電';
-- TM4517: 推測ロジック適用 (ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-12-16）
UPDATE call_records SET status_is = '90.失注', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4517' AND status = '未架電';
-- TM4522: 推測ロジック適用 (ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-12-16）
UPDATE call_records SET status_is = '90.失注', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4522' AND status = '未架電';
-- TM4525: 推測ロジック適用 (対応不可/失注理由(2. IS：税理士あり)が存在 → 通電している可能性が極めて高い, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-12-17）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4525' AND status = '未架電';
-- TM4526: 推測ロジック適用 (ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-12-18）
UPDATE call_records SET status_is = '90.失注', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4526' AND status = '未架電';
-- TM4532: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2024-12-24）
UPDATE call_records SET status_is = '90.失注', result_contact_status = '通電', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4532' AND status = '未架電';
-- TM4563: 推測ロジック適用 (ISステータス(07.既存顧客)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2025-01-27）
UPDATE call_records SET status_is = '07.既存顧客', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4563' AND status = '未架電';
-- TM4568: 推測ロジック適用 (ISステータス(07.既存顧客)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2025-01-30）
UPDATE call_records SET status_is = '07.既存顧客', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4568' AND status = '未架電';
-- TM4614: 推測ロジック適用 (ISステータス(31.トスミス（重複）)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2025-03-03）
UPDATE call_records SET status_is = '31.トスミス（重複）', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4614' AND status = '未架電';
-- TM4616: 推測ロジック適用 (ISステータス(90.失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2025-03-03）
UPDATE call_records SET status_is = '90.失注', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4616' AND status = '未架電';
-- TM4621: 推測ロジック適用 (会話メモが存在 → 架電して通電していると推測, ISステータス(失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2025-03-03）
UPDATE call_records SET status_is = '失注', result_contact_status = '通電', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4621' AND status = '未架電';
-- TM4622: 推測ロジック適用 (ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2025-03-04）
UPDATE call_records SET status_is = '90.失注', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4622' AND status = '未架電';
-- TM4624: 推測ロジック適用 (ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2025-03-04）
UPDATE call_records SET status_is = '90.失注', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4624' AND status = '未架電';
-- TM4628: 推測ロジック適用 (ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2025-03-04）
UPDATE call_records SET status_is = '90.失注', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4628' AND status = '未架電';
-- TM4655: 推測ロジック適用 (ISステータス(90.失注)が存在, 担当IS(田邊)が存在)（未架電→架電済に修正、連携日: 2025-03-11）
UPDATE call_records SET status_is = '90.失注', call_count = 1, staff_is = '田邊', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4655' AND status = '未架電';
-- TM4658: 推測ロジック適用 (ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2025-03-11）
UPDATE call_records SET status_is = '90.失注', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4658' AND status = '未架電';
-- TM4669: 推測ロジック適用 (ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2025-03-17）
UPDATE call_records SET status_is = '90.失注', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4669' AND status = '未架電';
-- TM4671: 推測ロジック適用 (ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2025-03-17）
UPDATE call_records SET status_is = '90.失注', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4671' AND status = '未架電';
-- TM4676: 推測ロジック適用 (ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2025-03-18）
UPDATE call_records SET status_is = '90.失注', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4676' AND status = '未架電';
-- TM4688: 推測ロジック適用 (ISステータス(90.失注)が存在, 担当IS(小田)が存在)（未架電→架電済に修正、連携日: 2025-03-24）
UPDATE call_records SET status_is = '90.失注', call_count = 1, staff_is = '小田', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4688' AND status = '未架電';
-- TM4701: 推測ロジック適用 (ISステータス(90.失注)が存在, 担当IS(小林)が存在)（未架電→架電済に修正、連携日: 2025-03-31）
UPDATE call_records SET status_is = '90.失注', call_count = 1, staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4701' AND status = '未架電';
-- TM4703: 推測ロジック適用 (ISステータス(90.失注)が存在, 担当IS(小林)が存在)（未架電→架電済に修正、連携日: 2025-04-02）
UPDATE call_records SET status_is = '90.失注', call_count = 1, staff_is = '小林', status = '架電中', updated_at = NOW() WHERE lead_id = 'TM4703' AND status = '未架電';
-- OC0216: 推測ロジック適用 (対応不可/失注理由(14.連携ミス)が存在 → 通電している可能性が極めて高い, ISステータス(05.対応不可/対象外)が存在, 担当IS(沢田)が存在)（未架電→架電済に修正）
UPDATE call_records SET status_is = '05.対応不可/対象外', result_contact_status = '通電', call_count = 1, staff_is = '沢田', status = '架電中', updated_at = NOW() WHERE lead_id = 'OC0216' AND status = '未架電';
-- OC0217: 推測ロジック適用 (対応不可/失注理由(14.連携ミス)が存在 → 通電している可能性が極めて高い, ISステータス(05.対応不可/対象外)が存在, 担当IS(沢田)が存在)（未架電→架電済に修正）
UPDATE call_records SET status_is = '05.対応不可/対象外', result_contact_status = '通電', call_count = 1, staff_is = '沢田', status = '架電中', updated_at = NOW() WHERE lead_id = 'OC0217' AND status = '未架電';

COMMIT;