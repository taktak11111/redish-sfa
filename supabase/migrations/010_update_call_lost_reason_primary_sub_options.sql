-- 架電（call）カテゴリ: 失注理由（主因/サブ/備忘テンプレ）を推奨案で更新
-- 実行日: 2026-01-11

-- 主因（5択）
INSERT INTO dropdown_settings (category, key, options, created_at, updated_at)
VALUES (
  'call',
  'lostReasonPrimary',
  '[
    {"value":"顧客要因","label":"顧客要因"},
    {"value":"自社要因","label":"自社要因"},
    {"value":"競合要因","label":"競合要因"},
    {"value":"自己対応","label":"自己対応"},
    {"value":"その他","label":"その他"}
  ]'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (category, key) DO UPDATE
SET options = EXCLUDED.options, updated_at = NOW();

-- サブ理由（顧客要因）
INSERT INTO dropdown_settings (category, key, options, created_at, updated_at)
VALUES (
  'call',
  'lostReasonCustomerSub',
  '[
    {"value":"話だけ聞いてみたい（開業見込みなし）","label":"話だけ聞いてみたい（開業見込みなし）"},
    {"value":"興味なし/不要","label":"興味なし/不要"},
    {"value":"予算オーバー","label":"予算オーバー"},
    {"value":"時期尚早/今じゃない","label":"時期尚早/今じゃない"},
    {"value":"時間尚早（時間帯が合わない）","label":"時間尚早（時間帯が合わない）"},
    {"value":"依頼記憶なし","label":"依頼記憶なし"}
  ]'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (category, key) DO UPDATE
SET options = EXCLUDED.options, updated_at = NOW();

-- サブ理由（自社要因）
INSERT INTO dropdown_settings (category, key, options, created_at, updated_at)
VALUES (
  'call',
  'lostReasonCompanySub',
  '[
    {"value":"弊社対応不可","label":"弊社対応不可"},
    {"value":"オンライン対応不可","label":"オンライン対応不可"},
    {"value":"連携ミス","label":"連携ミス"},
    {"value":"不明（要確認）","label":"不明（要確認）"}
  ]'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (category, key) DO UPDATE
SET options = EXCLUDED.options, updated_at = NOW();

-- サブ理由（競合要因）
INSERT INTO dropdown_settings (category, key, options, created_at, updated_at)
VALUES (
  'call',
  'lostReasonCompetitorSub',
  '[
    {"value":"税理士契約済","label":"税理士契約済"},
    {"value":"他税理士に決定","label":"他税理士に決定"},
    {"value":"競合に決定（価格）","label":"競合に決定（価格）"},
    {"value":"競合に決定（サービス）","label":"競合に決定（サービス）"}
  ]'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (category, key) DO UPDATE
SET options = EXCLUDED.options, updated_at = NOW();

-- サブ理由（自己対応）
INSERT INTO dropdown_settings (category, key, options, created_at, updated_at)
VALUES (
  'call',
  'lostReasonSelfSub',
  '[
    {"value":"自己対応（自分でやる）","label":"自己対応（自分でやる）"},
    {"value":"商工会議所・青色申告会等","label":"商工会議所・青色申告会等"}
  ]'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (category, key) DO UPDATE
SET options = EXCLUDED.options, updated_at = NOW();

-- サブ理由（その他）
INSERT INTO dropdown_settings (category, key, options, created_at, updated_at)
VALUES (
  'call',
  'lostReasonOtherSub',
  '[
    {"value":"完全未通電（架電5回以上、SMS反応なし）","label":"完全未通電（架電5回以上、SMS反応なし）"},
    {"value":"不明","label":"不明"},
    {"value":"その他","label":"その他"}
  ]'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (category, key) DO UPDATE
SET options = EXCLUDED.options, updated_at = NOW();

-- 備忘テンプレ（他税理士の内訳など）
INSERT INTO dropdown_settings (category, key, options, created_at, updated_at)
VALUES (
  'call',
  'lostReasonMemoTemplates',
  '[
    {"value":"他税理士:知り合い","label":"他税理士:知り合い"},
    {"value":"他税理士:面談あり","label":"他税理士:面談あり"},
    {"value":"他税理士:価格","label":"他税理士:価格"},
    {"value":"他税理士:サービス","label":"他税理士:サービス"}
  ]'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (category, key) DO UPDATE
SET options = EXCLUDED.options, updated_at = NOW();

