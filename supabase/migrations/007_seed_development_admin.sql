-- ===================================
-- Development Admin User Seed
-- 開発環境用の初期管理者ユーザーを作成
-- ===================================

-- 注意: usersテーブルはauth.usersテーブルへの外部キー制約があるため、
-- 実際のauth.usersテーブルにユーザーが存在する必要があります。

-- 既存のユーザーが存在する場合、最初のユーザーを管理者にする
UPDATE users 
SET role = 'admin',
    full_name = COALESCE(full_name, '開発ユーザー'),
    department = COALESCE(department, '開発'),
    updated_at = NOW()
WHERE id = (SELECT id FROM users ORDER BY created_at ASC LIMIT 1)
AND role != 'admin';

-- または、特定のメールアドレスのユーザーを管理者にする場合
-- 以下のコメントを解除して、実際のメールアドレスに置き換えてください
/*
UPDATE users 
SET role = 'admin',
    full_name = COALESCE(full_name, '開発ユーザー'),
    department = COALESCE(department, '開発'),
    updated_at = NOW()
WHERE email = 'tmatsukuma@redish.jp'
AND role != 'admin';
*/
