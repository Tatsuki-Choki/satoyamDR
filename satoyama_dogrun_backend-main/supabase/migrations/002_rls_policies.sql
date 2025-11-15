-- ============================================
-- Row Level Security (RLS) Policies
-- Satoyama Dogrun
-- ============================================

-- ============================================
-- RLS 有効化
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE terms_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccination_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ヘルパー関数
-- ============================================

-- 現在のユーザーIDを取得する関数
CREATE OR REPLACE FUNCTION auth.user_id()
RETURNS UUID AS $$
  SELECT COALESCE(
    NULLIF(current_setting('request.jwt.claim.sub', true), ''),
    (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid;
$$ LANGUAGE sql STABLE;

-- 管理者かどうかをチェックする関数
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.user_id()
    AND is_active = TRUE
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================
-- 1. users テーブル
-- ============================================

-- 本人のみ自分のデータを閲覧可能
CREATE POLICY "Users can view own data"
ON users FOR SELECT
TO authenticated
USING (id = auth.user_id());

-- 本人のみ自分のデータを更新可能
CREATE POLICY "Users can update own data"
ON users FOR UPDATE
TO authenticated
USING (id = auth.user_id())
WITH CHECK (id = auth.user_id());

-- 管理者は全ユーザーを閲覧可能
CREATE POLICY "Admins can view all users"
ON users FOR SELECT
TO authenticated
USING (is_admin());

-- 新規登録は誰でも可能（anon）
CREATE POLICY "Anyone can insert users"
ON users FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- ============================================
-- 2. admin_users テーブル
-- ============================================

-- 管理者のみ閲覧可能
CREATE POLICY "Only admins can view admin users"
ON admin_users FOR SELECT
TO authenticated
USING (is_admin());

-- スーパー管理者のみ作成・更新可能
CREATE POLICY "Only super admins can manage admin users"
ON admin_users FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.user_id()
    AND role = 'super_admin'
    AND is_active = TRUE
  )
);

-- ============================================
-- 3. admin_logs テーブル
-- ============================================

-- 管理者のみ閲覧可能
CREATE POLICY "Only admins can view admin logs"
ON admin_logs FOR SELECT
TO authenticated
USING (is_admin());

-- 管理者のみ作成可能
CREATE POLICY "Only admins can insert admin logs"
ON admin_logs FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- ============================================
-- 4. applications テーブル
-- ============================================

-- 申請者本人と管理者のみ閲覧可能
CREATE POLICY "Users can view own applications"
ON applications FOR SELECT
TO authenticated
USING (user_id = auth.user_id() OR is_admin());

-- 誰でも申請を作成可能（新規登録申請）
CREATE POLICY "Anyone can create applications"
ON applications FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 管理者のみ更新可能（承認・却下）
CREATE POLICY "Only admins can update applications"
ON applications FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================
-- 5. dogs テーブル
-- ============================================

-- 飼い主のみ自分の犬を閲覧可能
CREATE POLICY "Owners can view own dogs"
ON dogs FOR SELECT
TO authenticated
USING (owner_id = auth.user_id() OR is_admin());

-- 飼い主のみ自分の犬を作成可能
CREATE POLICY "Owners can create own dogs"
ON dogs FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.user_id());

-- 飼い主のみ自分の犬を更新可能
CREATE POLICY "Owners can update own dogs"
ON dogs FOR UPDATE
TO authenticated
USING (owner_id = auth.user_id())
WITH CHECK (owner_id = auth.user_id());

-- 飼い主のみ自分の犬を削除可能
CREATE POLICY "Owners can delete own dogs"
ON dogs FOR DELETE
TO authenticated
USING (owner_id = auth.user_id());

-- ============================================
-- 6. vaccination_records テーブル
-- ============================================

-- 飼い主のみ閲覧可能（犬のowner_id経由）
CREATE POLICY "Owners can view own dog vaccination records"
ON vaccination_records FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM dogs
    WHERE dogs.id = vaccination_records.dog_id
    AND dogs.owner_id = auth.user_id()
  ) OR is_admin()
);

-- 飼い主のみ作成可能
CREATE POLICY "Owners can create own dog vaccination records"
ON vaccination_records FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM dogs
    WHERE dogs.id = vaccination_records.dog_id
    AND dogs.owner_id = auth.user_id()
  )
);

-- 飼い主のみ更新・削除可能
CREATE POLICY "Owners can update own dog vaccination records"
ON vaccination_records FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM dogs
    WHERE dogs.id = vaccination_records.dog_id
    AND dogs.owner_id = auth.user_id()
  )
);

CREATE POLICY "Owners can delete own dog vaccination records"
ON vaccination_records FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM dogs
    WHERE dogs.id = vaccination_records.dog_id
    AND dogs.owner_id = auth.user_id()
  )
);

-- ============================================
-- 7. posts テーブル
-- ============================================

-- 承認済み投稿は誰でも閲覧可能
CREATE POLICY "Anyone can view approved posts"
ON posts FOR SELECT
TO anon, authenticated
USING (status = 'approved');

-- 本人は自分の投稿を閲覧可能
CREATE POLICY "Users can view own posts"
ON posts FOR SELECT
TO authenticated
USING (user_id = auth.user_id());

-- 管理者は全投稿を閲覧可能
CREATE POLICY "Admins can view all posts"
ON posts FOR SELECT
TO authenticated
USING (is_admin());

-- 認証ユーザーのみ投稿作成可能
CREATE POLICY "Authenticated users can create posts"
ON posts FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.user_id());

-- 本人のみ自分の投稿を更新可能
CREATE POLICY "Users can update own posts"
ON posts FOR UPDATE
TO authenticated
USING (user_id = auth.user_id())
WITH CHECK (user_id = auth.user_id());

-- 管理者は全投稿を更新可能（ステータス変更）
CREATE POLICY "Admins can update all posts"
ON posts FOR UPDATE
TO authenticated
USING (is_admin());

-- 本人のみ自分の投稿を削除可能
CREATE POLICY "Users can delete own posts"
ON posts FOR DELETE
TO authenticated
USING (user_id = auth.user_id());

-- 管理者は全投稿を削除可能
CREATE POLICY "Admins can delete all posts"
ON posts FOR DELETE
TO authenticated
USING (is_admin());

-- ============================================
-- 8. post_images テーブル
-- ============================================

-- 投稿が閲覧可能な場合、画像も閲覧可能
CREATE POLICY "Anyone can view approved post images"
ON post_images FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM posts
    WHERE posts.id = post_images.post_id
    AND posts.status = 'approved'
  )
);

-- 本人は自分の投稿画像を閲覧可能
CREATE POLICY "Users can view own post images"
ON post_images FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM posts
    WHERE posts.id = post_images.post_id
    AND posts.user_id = auth.user_id()
  )
);

-- 認証ユーザーは自分の投稿に画像を追加可能
CREATE POLICY "Users can insert own post images"
ON post_images FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM posts
    WHERE posts.id = post_images.post_id
    AND posts.user_id = auth.user_id()
  )
);

-- 本人のみ自分の投稿画像を削除可能
CREATE POLICY "Users can delete own post images"
ON post_images FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM posts
    WHERE posts.id = post_images.post_id
    AND posts.user_id = auth.user_id()
  )
);

-- ============================================
-- 9. comments テーブル
-- ============================================

-- 承認済み投稿のコメントは誰でも閲覧可能
CREATE POLICY "Anyone can view comments on approved posts"
ON comments FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM posts
    WHERE posts.id = comments.post_id
    AND posts.status = 'approved'
  )
);

-- 認証ユーザーのみコメント作成可能
CREATE POLICY "Authenticated users can create comments"
ON comments FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.user_id());

-- 本人のみ自分のコメントを削除可能
CREATE POLICY "Users can delete own comments"
ON comments FOR DELETE
TO authenticated
USING (user_id = auth.user_id());

-- 管理者は全コメントを削除可能
CREATE POLICY "Admins can delete all comments"
ON comments FOR DELETE
TO authenticated
USING (is_admin());

-- ============================================
-- 10. likes テーブル
-- ============================================

-- 承認済み投稿のいいねは誰でも閲覧可能
CREATE POLICY "Anyone can view likes on approved posts"
ON likes FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM posts
    WHERE posts.id = likes.post_id
    AND posts.status = 'approved'
  )
);

-- 認証ユーザーのみいいね可能
CREATE POLICY "Authenticated users can like posts"
ON likes FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.user_id());

-- 本人のみ自分のいいねを削除可能
CREATE POLICY "Users can delete own likes"
ON likes FOR DELETE
TO authenticated
USING (user_id = auth.user_id());

-- ============================================
-- 11. bookmarks テーブル
-- ============================================

-- 本人のみ自分のブックマークを閲覧可能
CREATE POLICY "Users can view own bookmarks"
ON bookmarks FOR SELECT
TO authenticated
USING (user_id = auth.user_id());

-- 認証ユーザーのみブックマーク可能
CREATE POLICY "Authenticated users can bookmark posts"
ON bookmarks FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.user_id());

-- 本人のみ自分のブックマークを削除可能
CREATE POLICY "Users can delete own bookmarks"
ON bookmarks FOR DELETE
TO authenticated
USING (user_id = auth.user_id());

-- ============================================
-- 12. events テーブル
-- ============================================

-- 誰でも公開イベントを閲覧可能
CREATE POLICY "Anyone can view events"
ON events FOR SELECT
TO anon, authenticated
USING (true);

-- 管理者のみイベント作成・更新・削除可能
CREATE POLICY "Only admins can manage events"
ON events FOR ALL
TO authenticated
USING (is_admin());

-- ============================================
-- 13. event_registrations テーブル
-- ============================================

-- 本人のみ自分の登録を閲覧可能
CREATE POLICY "Users can view own event registrations"
ON event_registrations FOR SELECT
TO authenticated
USING (user_id = auth.user_id() OR is_admin());

-- 認証ユーザーのみイベント登録可能
CREATE POLICY "Authenticated users can register for events"
ON event_registrations FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.user_id());

-- 本人のみ自分の登録を削除可能
CREATE POLICY "Users can delete own event registrations"
ON event_registrations FOR DELETE
TO authenticated
USING (user_id = auth.user_id());

-- ============================================
-- 14. 公開情報テーブル（誰でも閲覧可能）
-- ============================================

-- announcements, business_hours, special_holidays, notices, hashtags, tags
CREATE POLICY "Anyone can view announcements"
ON announcements FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can view business hours"
ON business_hours FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can view special holidays"
ON special_holidays FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can view published notices"
ON notices FOR SELECT
TO anon, authenticated
USING (status = 'published');

CREATE POLICY "Anyone can view hashtags"
ON hashtags FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can view tags"
ON tags FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can view post hashtags"
ON post_hashtags FOR SELECT
TO anon, authenticated
USING (true);

-- 管理者のみ作成・更新・削除可能
CREATE POLICY "Only admins can manage announcements"
ON announcements FOR ALL
TO authenticated
USING (is_admin());

CREATE POLICY "Only admins can manage business hours"
ON business_hours FOR ALL
TO authenticated
USING (is_admin());

CREATE POLICY "Only admins can manage special holidays"
ON special_holidays FOR ALL
TO authenticated
USING (is_admin());

CREATE POLICY "Only admins can manage notices"
ON notices FOR ALL
TO authenticated
USING (is_admin());

CREATE POLICY "Only admins can manage tags"
ON tags FOR ALL
TO authenticated
USING (is_admin());

-- ============================================
-- 15. terms, terms_acceptances テーブル
-- ============================================

-- 誰でも利用規約を閲覧可能
CREATE POLICY "Anyone can view terms"
ON terms FOR SELECT
TO anon, authenticated
USING (true);

-- 管理者のみ利用規約を更新可能
CREATE POLICY "Only admins can manage terms"
ON terms FOR ALL
TO authenticated
USING (is_admin());

-- 本人のみ自分の承認記録を閲覧可能
CREATE POLICY "Users can view own terms acceptances"
ON terms_acceptances FOR SELECT
TO authenticated
USING (user_id = auth.user_id());

-- 認証ユーザーのみ規約承認可能
CREATE POLICY "Authenticated users can accept terms"
ON terms_acceptances FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.user_id());

-- ============================================
-- 16. entry_logs テーブル
-- ============================================

-- 本人のみ自分の入退場ログを閲覧可能
CREATE POLICY "Users can view own entry logs"
ON entry_logs FOR SELECT
TO authenticated
USING (user_id = auth.user_id() OR is_admin());

-- 認証ユーザーのみ入退場記録可能
CREATE POLICY "Authenticated users can create entry logs"
ON entry_logs FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.user_id());

-- ============================================
-- 17. system_settings テーブル
-- ============================================

-- 公開設定のみ誰でも閲覧可能
CREATE POLICY "Anyone can view public system settings"
ON system_settings FOR SELECT
TO anon, authenticated
USING (is_public = TRUE);

-- 管理者は全設定を閲覧・管理可能
CREATE POLICY "Admins can view all system settings"
ON system_settings FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "Only admins can manage system settings"
ON system_settings FOR ALL
TO authenticated
USING (is_admin());

-- ============================================
-- 完了
-- ============================================
