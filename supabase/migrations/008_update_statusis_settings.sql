-- ISステータスの設定を実データに更新
-- 実行日: 2026-01-08

UPDATE dropdown_settings
SET 
  options = '[
    {"value": "01.新規リード", "label": "01.新規リード"},
    {"value": "02.コンタクト試行中", "label": "02.コンタクト試行中"},
    {"value": "03.アポイント獲得済", "label": "03.アポイント獲得済"},
    {"value": "04.失注（ナーチャリング対象外）", "label": "04.失注（ナーチャリング対象外）"},
    {"value": "05.対応不可/対象外", "label": "05.対応不可/対象外"},
    {"value": "06.ナーチャリング対象", "label": "06.ナーチャリング対象"},
    {"value": "07.既存顧客", "label": "07.既存顧客"}
  ]'::jsonb,
  updated_at = NOW()
WHERE category = 'call' AND key = 'statusIS';

-- もしレコードが存在しない場合は作成
INSERT INTO dropdown_settings (category, key, options, created_at, updated_at)
VALUES (
  'call',
  'statusIS',
  '[
    {"value": "01.新規リード", "label": "01.新規リード"},
    {"value": "02.コンタクト試行中", "label": "02.コンタクト試行中"},
    {"value": "03.アポイント獲得済", "label": "03.アポイント獲得済"},
    {"value": "04.失注（ナーチャリング対象外）", "label": "04.失注（ナーチャリング対象外）"},
    {"value": "05.対応不可/対象外", "label": "05.対応不可/対象外"},
    {"value": "06.ナーチャリング対象", "label": "06.ナーチャリング対象"},
    {"value": "07.既存顧客", "label": "07.既存顧客"}
  ]'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (category, key) DO NOTHING;
