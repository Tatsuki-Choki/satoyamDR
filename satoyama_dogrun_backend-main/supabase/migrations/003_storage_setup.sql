-- ============================================
-- Supabase Storage Setup
-- Satoyama Dogrun
-- ============================================

-- ============================================
-- ストレージバケットの作成
-- ============================================

-- 1. avatars バケット（公開）
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. posts バケット（公開）
INSERT INTO storage.buckets (id, name, public)
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

-- 3. vaccine-certificates バケット（非公開）
INSERT INTO storage.buckets (id, name, public)
VALUES ('vaccine-certificates', 'vaccine-certificates', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Storage RLS Policies
-- ============================================

-- ────────────────────────────────────────
-- avatars バケット
-- ────────────────────────────────────────

-- 誰でも閲覧可能
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'avatars');

-- 認証ユーザーのみアップロード可能
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.user_id() IS NOT NULL
);

-- 本人のみ自分のアバターを更新・削除可能
CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.user_id()::text
);

CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.user_id()::text
);

-- ────────────────────────────────────────
-- posts バケット
-- ────────────────────────────────────────

-- 誰でも閲覧可能
CREATE POLICY "Anyone can view post images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'posts');

-- 認証ユーザーのみアップロード可能
CREATE POLICY "Authenticated users can upload post images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'posts'
  AND auth.user_id() IS NOT NULL
);

-- 本人のみ自分の投稿画像を削除可能
CREATE POLICY "Users can delete own post images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'posts'
  AND (storage.foldername(name))[1] = auth.user_id()::text
);

-- ────────────────────────────────────────
-- vaccine-certificates バケット
-- ────────────────────────────────────────

-- 本人と管理者のみ閲覧可能
CREATE POLICY "Users can view own vaccine certificates"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'vaccine-certificates'
  AND (
    (storage.foldername(name))[1] = auth.user_id()::text
    OR is_admin()
  )
);

-- 認証ユーザーのみアップロード可能（自分のフォルダのみ）
CREATE POLICY "Users can upload own vaccine certificates"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'vaccine-certificates'
  AND (storage.foldername(name))[1] = auth.user_id()::text
);

-- 本人のみ自分の証明書を削除可能
CREATE POLICY "Users can delete own vaccine certificates"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'vaccine-certificates'
  AND (storage.foldername(name))[1] = auth.user_id()::text
);

-- ============================================
-- ファイルサイズ制限（アプリケーションレベルで制御）
-- ============================================

-- Supabase では、バケットごとにファイルサイズ制限を設定できます。
-- これは Supabase Dashboard > Storage > Bucket Settings で設定してください。
-- 推奨設定：
-- - avatars: 最大 2MB
-- - posts: 最大 5MB
-- - vaccine-certificates: 最大 10MB

-- ============================================
-- 完了
-- ============================================

COMMENT ON COLUMN storage.buckets.public IS 'バケットが公開かどうか';
