-- 架電（call）カテゴリの失注理由・到達不能の設定を整理
-- 実行日: 2026-01-11

-- =========================
-- 1) ステータス（混在防止）
-- =========================
INSERT INTO dropdown_settings (category, key, options, created_at, updated_at)
VALUES (
  'call',
  'statusIS',
  '[
    {"value":"01.新規リード","label":"01.新規リード"},
    {"value":"02.コンタクト試行中","label":"02.コンタクト試行中"},
    {"value":"03.アポイント獲得済","label":"03.アポイント獲得済"},
    {"value":"04.失注（ナーチャリング対象外）","label":"04.失注（ナーチャリング対象外）"},
    {"value":"06.ナーチャリング対象","label":"06.ナーチャリング対象"},
    {"value":"05a.対象外（Disqualified）","label":"05a.対象外（Disqualified）"},
    {"value":"05b.連絡不能（Unreachable）","label":"05b.連絡不能（Unreachable）"},
    {"value":"05.対応不可/対象外（旧）","label":"05.対応不可/対象外（旧）"},
    {"value":"07.既存顧客（属性へ移行予定）","label":"07.既存顧客（属性へ移行予定）"}
  ]'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (category, key) DO UPDATE
SET options = EXCLUDED.options, updated_at = NOW();

INSERT INTO dropdown_settings (category, key, options, created_at, updated_at)
VALUES (
  'call',
  'customerType',
  '[
    {"value":"見込み客","label":"見込み客"},
    {"value":"既存顧客","label":"既存顧客"}
  ]'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (category, key) DO UPDATE
SET options = EXCLUDED.options, updated_at = NOW();

INSERT INTO dropdown_settings (category, key, options, created_at, updated_at)
VALUES (
  'call',
  'resultContactStatus',
  '[
    {"value":"未架電","label":"未架電"},
    {"value":"不通","label":"不通"},
    {"value":"通電","label":"通電"},
    {"value":"連絡取れた（旧）","label":"連絡取れた（旧）"},
    {"value":"不在（旧）","label":"不在（旧）"},
    {"value":"拒否（旧）","label":"拒否（旧）"}
  ]'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (category, key) DO UPDATE
SET options = EXCLUDED.options, updated_at = NOW();

-- =========================
-- 2) 対象外・連絡不能（旧/新）
-- =========================
INSERT INTO dropdown_settings (category, key, options, created_at, updated_at)
VALUES (
  'call',
  'cannotContactReason',
  '[
    {"value":"D1.心当たりなし（何のことかわからない）","label":"D1.心当たりなし（何のことかわからない）"},
    {"value":"D2.言葉が通じない（言語障壁）","label":"D2.言葉が通じない（言語障壁）"},
    {"value":"D3.完全に興味なし","label":"D3.完全に興味なし"},
    {"value":"U1.番号違い","label":"U1.番号違い"},
    {"value":"U2.番号不備","label":"U2.番号不備"},
    {"value":"不在（旧）","label":"不在（旧）"},
    {"value":"拒否（旧）","label":"拒否（旧）"},
    {"value":"電話番号誤り（旧）","label":"電話番号誤り（旧）"}
  ]'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (category, key) DO UPDATE
SET options = EXCLUDED.options, updated_at = NOW();

INSERT INTO dropdown_settings (category, key, options, created_at, updated_at)
VALUES (
  'call',
  'disqualifyReason',
  '[
    {"value":"D1.心当たりなし（何のことかわからない）","label":"D1.心当たりなし（何のことかわからない）"},
    {"value":"D2.言葉が通じない（言語障壁）","label":"D2.言葉が通じない（言語障壁）"},
    {"value":"D3.完全に興味なし","label":"D3.完全に興味なし"}
  ]'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (category, key) DO UPDATE
SET options = EXCLUDED.options, updated_at = NOW();

INSERT INTO dropdown_settings (category, key, options, created_at, updated_at)
VALUES (
  'call',
  'unreachableReason',
  '[
    {"value":"U1.番号違い","label":"U1.番号違い"},
    {"value":"U2.番号不備","label":"U2.番号不備"}
  ]'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (category, key) DO UPDATE
SET options = EXCLUDED.options, updated_at = NOW();

-- =========================
-- 3) 失注理由（架電）: 主因＋サブ理由＋備忘テンプレ
-- =========================
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

INSERT INTO dropdown_settings (category, key, options, created_at, updated_at)
VALUES (
  'call',
  'lostReasonCustomerSub',
  '[
    {"value":"話だけ聞いてみたい（開業見込みなし）","label":"話だけ聞いてみたい（開業見込みなし）"},
    {"value":"興味なし/不要","label":"興味なし/不要"},
    {"value":"予算オーバー","label":"予算オーバー"},
    {"value":"時期尚早/今じゃない","label":"時期尚早/今じゃない"},
    {"value":"検討中（家族/共同決裁）","label":"検討中（家族/共同決裁）"}
  ]'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (category, key) DO UPDATE
SET options = EXCLUDED.options, updated_at = NOW();

INSERT INTO dropdown_settings (category, key, options, created_at, updated_at)
VALUES (
  'call',
  'lostReasonCompanySub',
  '[
    {"value":"弊社対応不可（提供範囲外）","label":"弊社対応不可（提供範囲外）"},
    {"value":"エリア/オンライン対応不可","label":"エリア/オンライン対応不可"},
    {"value":"連携ミス/情報不足","label":"連携ミス/情報不足"},
    {"value":"時間帯/スケジュール不一致","label":"時間帯/スケジュール不一致"}
  ]'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (category, key) DO UPDATE
SET options = EXCLUDED.options, updated_at = NOW();

INSERT INTO dropdown_settings (category, key, options, created_at, updated_at)
VALUES (
  'call',
  'lostReasonCompetitorSub',
  '[
    {"value":"他税理士（継続/契約済）","label":"他税理士（継続/契約済）"},
    {"value":"競合に決定（価格）","label":"競合に決定（価格）"},
    {"value":"競合に決定（サービス）","label":"競合に決定（サービス）"},
    {"value":"競合に決定（その他）","label":"競合に決定（その他）"}
  ]'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (category, key) DO UPDATE
SET options = EXCLUDED.options, updated_at = NOW();

INSERT INTO dropdown_settings (category, key, options, created_at, updated_at)
VALUES (
  'call',
  'lostReasonSelfSub',
  '[
    {"value":"自己対応（自分でやる）","label":"自己対応（自分でやる）"},
    {"value":"社内対応（知人/家族/社内で対応）","label":"社内対応（知人/家族/社内で対応）"},
    {"value":"商工会議所・青色申告会等","label":"商工会議所・青色申告会等"}
  ]'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (category, key) DO UPDATE
SET options = EXCLUDED.options, updated_at = NOW();

INSERT INTO dropdown_settings (category, key, options, created_at, updated_at)
VALUES (
  'call',
  'lostReasonOtherSub',
  '[
    {"value":"不明","label":"不明"},
    {"value":"その他","label":"その他"}
  ]'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (category, key) DO UPDATE
SET options = EXCLUDED.options, updated_at = NOW();

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

