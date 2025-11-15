-- ============================================================================
-- Helper Functions
-- ============================================================================
-- いいね数・コメント数の増減などのヘルパー関数

-- いいね数を増やす
CREATE OR REPLACE FUNCTION increment_likes_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE posts
  SET likes_count = likes_count + 1
  WHERE id = post_id;
END;
$$;

-- いいね数を減らす
CREATE OR REPLACE FUNCTION decrement_likes_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE posts
  SET likes_count = GREATEST(likes_count - 1, 0)
  WHERE id = post_id;
END;
$$;

-- コメント数を増やす
CREATE OR REPLACE FUNCTION increment_comments_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE posts
  SET comments_count = comments_count + 1
  WHERE id = post_id;
END;
$$;

-- コメント数を減らす
CREATE OR REPLACE FUNCTION decrement_comments_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE posts
  SET comments_count = GREATEST(comments_count - 1, 0)
  WHERE id = post_id;
END;
$$;

-- イベント参加者数を増やす
CREATE OR REPLACE FUNCTION increment_event_participants(event_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE events
  SET current_participants = current_participants + 1
  WHERE id = event_id;
END;
$$;

-- イベント参加者数を減らす
CREATE OR REPLACE FUNCTION decrement_event_participants(event_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE events
  SET current_participants = GREATEST(current_participants - 1, 0)
  WHERE id = event_id;
END;
$$;

-- ============================================================================
-- トリガー：いいね追加時に自動的にカウントを増やす
-- ============================================================================
CREATE OR REPLACE FUNCTION auto_increment_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE posts
  SET likes_count = likes_count + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_increment_likes_count
AFTER INSERT ON likes
FOR EACH ROW
EXECUTE FUNCTION auto_increment_likes_count();

-- ============================================================================
-- トリガー：いいね削除時に自動的にカウントを減らす
-- ============================================================================
CREATE OR REPLACE FUNCTION auto_decrement_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE posts
  SET likes_count = GREATEST(likes_count - 1, 0)
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$;

CREATE TRIGGER trigger_auto_decrement_likes_count
AFTER DELETE ON likes
FOR EACH ROW
EXECUTE FUNCTION auto_decrement_likes_count();

-- ============================================================================
-- トリガー：コメント追加時に自動的にカウントを増やす
-- ============================================================================
CREATE OR REPLACE FUNCTION auto_increment_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE posts
  SET comments_count = comments_count + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_increment_comments_count
AFTER INSERT ON comments
FOR EACH ROW
EXECUTE FUNCTION auto_increment_comments_count();

-- ============================================================================
-- トリガー：コメント削除時に自動的にカウントを減らす
-- ============================================================================
CREATE OR REPLACE FUNCTION auto_decrement_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE posts
  SET comments_count = GREATEST(comments_count - 1, 0)
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$;

CREATE TRIGGER trigger_auto_decrement_comments_count
AFTER DELETE ON comments
FOR EACH ROW
EXECUTE FUNCTION auto_decrement_comments_count();

-- ============================================================================
-- 投稿の検索用関数（全文検索）
-- ============================================================================
CREATE OR REPLACE FUNCTION search_posts(search_query TEXT, limit_count INTEGER DEFAULT 20)
RETURNS SETOF posts
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM posts
  WHERE
    status = 'published'
    AND is_public = true
    AND content ILIKE '%' || search_query || '%'
  ORDER BY created_at DESC
  LIMIT limit_count;
END;
$$;

-- ============================================================================
-- ユーザーのフィード取得（フォロー中のユーザーの投稿）
-- 注：現在のスキーマにはフォロー機能がないため、将来の拡張用
-- ============================================================================
-- CREATE TABLE IF NOT EXISTS follows (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--   following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--   UNIQUE(follower_id, following_id)
-- );

-- CREATE OR REPLACE FUNCTION get_user_feed(user_id UUID, limit_count INTEGER DEFAULT 20)
-- RETURNS SETOF posts
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- AS $$
-- BEGIN
--   RETURN QUERY
--   SELECT p.*
--   FROM posts p
--   INNER JOIN follows f ON p.user_id = f.following_id
--   WHERE
--     f.follower_id = user_id
--     AND p.status = 'published'
--     AND p.is_public = true
--   ORDER BY p.created_at DESC
--   LIMIT limit_count;
-- END;
-- $$;
