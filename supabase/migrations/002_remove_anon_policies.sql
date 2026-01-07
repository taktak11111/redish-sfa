　　　　Ｖ-- ===================================
-- REDISH SFA: anon RLSポリシー削除
-- Version: 2.0.0
-- 目的: セキュリティリスク対応
-- ===================================

-- ⚠️ 重要: このSQLは本番環境適用前に必ずバックアップを取得してください

-- ===================================
-- 1. call_records テーブルの anon ポリシー削除
-- ===================================
DROP POLICY IF EXISTS "Anon users can view call_records" ON call_records;
DROP POLICY IF EXISTS "Anon users can insert call_records" ON call_records;
DROP POLICY IF EXISTS "Anon users can update call_records" ON call_records;
DROP POLICY IF EXISTS "Anon users can delete call_records" ON call_records;

-- ===================================
-- 2. call_history テーブルの anon ポリシー削除
-- ===================================
DROP POLICY IF EXISTS "Anon users can view call_history" ON call_history;
DROP POLICY IF EXISTS "Anon users can insert call_history" ON call_history;
DROP POLICY IF EXISTS "Anon users can update call_history" ON call_history;
DROP POLICY IF EXISTS "Anon users can delete call_history" ON call_history;

-- ===================================
-- 3. deals テーブルの anon ポリシー削除
-- ===================================
DROP POLICY IF EXISTS "Anon users can view deals" ON deals;
DROP POLICY IF EXISTS "Anon users can insert deals" ON deals;
DROP POLICY IF EXISTS "Anon users can update deals" ON deals;
DROP POLICY IF EXISTS "Anon users can delete deals" ON deals;

-- ===================================
-- 4. dropdown_settings テーブルの anon ポリシー削除
-- ===================================
DROP POLICY IF EXISTS "Anon users can view dropdown_settings" ON dropdown_settings;
DROP POLICY IF EXISTS "Anon users can insert dropdown_settings" ON dropdown_settings;
DROP POLICY IF EXISTS "Anon users can update dropdown_settings" ON dropdown_settings;

-- ===================================
-- 5. users テーブルの anon ポリシー削除（念のため）
-- ===================================
DROP POLICY IF EXISTS "Anon users can view users" ON users;
DROP POLICY IF EXISTS "Anon users can insert users" ON users;
DROP POLICY IF EXISTS "Anon users can update users" ON users;
DROP POLICY IF EXISTS "Anon users can delete users" ON users;

-- ===================================
-- 6. セキュリティ状態の自動検証（要件 3.1, 3.2, 3.3）
-- ===================================
DO $$
DECLARE
  anon_policy_count INTEGER;
BEGIN
  -- anon ロールを含むポリシーの件数をカウント
  SELECT COUNT(*) INTO anon_policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND roles::text LIKE '%anon%';
  
  -- 検証結果の表示
  IF anon_policy_count = 0 THEN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'セキュリティチェック：合格';
    RAISE NOTICE 'anon ポリシー件数: 0件';
    RAISE NOTICE '========================================';
  ELSE
    RAISE WARNING '========================================';
    RAISE WARNING 'セキュリティチェック：不合格';
    RAISE WARNING 'anon ポリシーが % 件残っています', anon_policy_count;
    RAISE WARNING '========================================';
    
    -- 残っているポリシーの詳細を表示
    RAISE NOTICE '残っている anon ポリシー一覧:';
    FOR rec IN 
      SELECT tablename, policyname, roles
      FROM pg_policies
      WHERE schemaname = 'public'
        AND roles::text LIKE '%anon%'
      ORDER BY tablename, policyname
    LOOP
      RAISE NOTICE '  - テーブル: %, ポリシー: %, ロール: %', rec.tablename, rec.policyname, rec.roles;
    END LOOP;
  END IF;
END $$;

-- ===================================
-- 7. 全ポリシー一覧（参考用）
-- ===================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

