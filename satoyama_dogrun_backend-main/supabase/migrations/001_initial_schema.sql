-- ============================================
-- Satoyama Dogrun Database Migration
-- PostgreSQL Schema (Supabase)
-- ============================================

-- UUID拡張を有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- updated_at 自動更新関数
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ENUM型の定義
-- ============================================

CREATE TYPE entry_action AS ENUM ('entry', 'exit');
CREATE TYPE event_status AS ENUM ('受付中', '準備中', '終了');
CREATE TYPE admin_role AS ENUM ('super_admin', 'admin', 'moderator');
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE post_status AS ENUM ('pending', 'approved', 'rejected', 'reported');
CREATE TYPE notice_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE notice_priority AS ENUM ('low', 'normal', 'high', 'urgent');

-- ============================================
-- テーブル作成
-- ============================================

-- ────────────────────────────────────────
-- 1. ユーザーテーブル
-- ────────────────────────────────────────
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    last_name VARCHAR(50),
    first_name VARCHAR(50),
    age INTEGER,
    gender VARCHAR(10),
    zip_code VARCHAR(10),
    prefecture VARCHAR(20),
    city VARCHAR(50),
    address VARCHAR(255),
    building VARCHAR(255),
    phone_number VARCHAR(20),
    avatar_url VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

CREATE TRIGGER set_updated_at_users
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ────────────────────────────────────────
-- 2. 管理者ユーザーテーブル
-- ────────────────────────────────────────
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    role admin_role DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role ON admin_users(role);

CREATE TRIGGER set_updated_at_admin_users
BEFORE UPDATE ON admin_users
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ────────────────────────────────────────
-- 3. 管理者操作ログテーブル
-- ────────────────────────────────────────
CREATE TABLE admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id UUID,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_logs_admin_user_id ON admin_logs(admin_user_id);
CREATE INDEX idx_admin_logs_created_at ON admin_logs(created_at DESC);

-- ────────────────────────────────────────
-- 4. 申請テーブル
-- ────────────────────────────────────────
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    -- ユーザー情報（申請時に保存）
    user_email VARCHAR(255),
    user_password_hash VARCHAR(255),
    user_last_name VARCHAR(50),
    user_first_name VARCHAR(50),
    user_phone VARCHAR(20),
    user_address VARCHAR(255),
    user_prefecture VARCHAR(50),
    user_city VARCHAR(50),
    user_postal_code VARCHAR(10),
    -- 犬情報
    dog_name VARCHAR(50) NOT NULL,
    dog_breed VARCHAR(50),
    dog_weight VARCHAR(20),
    dog_age INTEGER,
    dog_gender VARCHAR(10),
    vaccine_certificate VARCHAR(255),
    request_date DATE,
    request_time VARCHAR(20),
    status application_status DEFAULT 'pending',
    admin_notes TEXT,
    approved_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_created_at ON applications(created_at DESC);

CREATE TRIGGER set_updated_at_applications
BEFORE UPDATE ON applications
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ────────────────────────────────────────
-- 5. 利用規約テーブル
-- ────────────────────────────────────────
CREATE TABLE terms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_updated_at_terms
BEFORE UPDATE ON terms
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ────────────────────────────────────────
-- 6. 利用規約承認テーブル
-- ────────────────────────────────────────
CREATE TABLE terms_acceptances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    term_id UUID NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
    accepted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, term_id)
);

CREATE INDEX idx_terms_acceptances_user_id ON terms_acceptances(user_id);

-- ────────────────────────────────────────
-- 7. 犬テーブル
-- ────────────────────────────────────────
CREATE TABLE dogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    breed VARCHAR(50),
    birthday_at DATE NOT NULL,
    gender VARCHAR(10),
    personality TEXT,
    likes TEXT,
    avatar_url VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dogs_owner_id ON dogs(owner_id);

CREATE TRIGGER set_updated_at_dogs
BEFORE UPDATE ON dogs
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ────────────────────────────────────────
-- 8. ワクチン接種記録テーブル
-- ────────────────────────────────────────
CREATE TABLE vaccination_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
    vaccine_type VARCHAR(100),
    administered_at DATE,
    next_due_at DATE,
    image_url VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vaccination_records_dog_id ON vaccination_records(dog_id);

CREATE TRIGGER set_updated_at_vaccination_records
BEFORE UPDATE ON vaccination_records
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ────────────────────────────────────────
-- 9. 入退場ログテーブル
-- ────────────────────────────────────────
CREATE TABLE entry_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action entry_action NOT NULL,
    occurred_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_entry_logs_user_id ON entry_logs(user_id);
CREATE INDEX idx_entry_logs_occurred_at ON entry_logs(occurred_at DESC);

-- ────────────────────────────────────────
-- 10. イベントテーブル
-- ────────────────────────────────────────
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    event_date DATE,
    start_time TIME,
    end_time TIME,
    location VARCHAR(255),
    capacity INTEGER,
    fee INTEGER,
    status event_status DEFAULT '受付中',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_status ON events(status);

CREATE TRIGGER set_updated_at_events
BEFORE UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ────────────────────────────────────────
-- 11. イベント登録テーブル
-- ────────────────────────────────────────
CREATE TABLE event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    dog_id UUID REFERENCES dogs(id) ON DELETE SET NULL,
    UNIQUE(user_id, event_id, dog_id)
);

CREATE INDEX idx_event_registrations_user_id ON event_registrations(user_id);
CREATE INDEX idx_event_registrations_event_id ON event_registrations(event_id);

-- ────────────────────────────────────────
-- 12. アナウンスメントテーブル
-- ────────────────────────────────────────
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(100) NOT NULL,
    content TEXT,
    category VARCHAR(50),
    posted_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_announcements_posted_at ON announcements(posted_at DESC);

CREATE TRIGGER set_updated_at_announcements
BEFORE UPDATE ON announcements
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ────────────────────────────────────────
-- 13. 投稿テーブル
-- ────────────────────────────────────────
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    status post_status DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

CREATE TRIGGER set_updated_at_posts
BEFORE UPDATE ON posts
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ────────────────────────────────────────
-- 14. 投稿画像テーブル
-- ────────────────────────────────────────
CREATE TABLE post_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    image_url VARCHAR(255)
);

CREATE INDEX idx_post_images_post_id ON post_images(post_id);

-- ────────────────────────────────────────
-- 15. ハッシュタグテーブル
-- ────────────────────────────────────────
CREATE TABLE hashtags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tag VARCHAR(50) UNIQUE NOT NULL
);

CREATE INDEX idx_hashtags_tag ON hashtags(tag);

-- ────────────────────────────────────────
-- 16. 投稿ハッシュタグ関連テーブル
-- ────────────────────────────────────────
CREATE TABLE post_hashtags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    hashtag_id UUID NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
    UNIQUE(post_id, hashtag_id)
);

CREATE INDEX idx_post_hashtags_post_id ON post_hashtags(post_id);
CREATE INDEX idx_post_hashtags_hashtag_id ON post_hashtags(hashtag_id);

-- ────────────────────────────────────────
-- 17. コメントテーブル
-- ────────────────────────────────────────
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- ────────────────────────────────────────
-- 18. いいねテーブル
-- ────────────────────────────────────────
CREATE TABLE likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);

-- ────────────────────────────────────────
-- 19. ブックマークテーブル
-- ────────────────────────────────────────
CREATE TABLE bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

CREATE INDEX idx_bookmarks_post_id ON bookmarks(post_id);
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);

-- ────────────────────────────────────────
-- 20. 営業時間テーブル
-- ────────────────────────────────────────
CREATE TABLE business_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day_of_week INTEGER NOT NULL UNIQUE CHECK (day_of_week >= 0 AND day_of_week <= 6),
    is_open BOOLEAN DEFAULT TRUE,
    open_time TIME,
    close_time TIME,
    special_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_updated_at_business_hours
BEFORE UPDATE ON business_hours
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ────────────────────────────────────────
-- 21. 特別営業日テーブル
-- ────────────────────────────────────────
CREATE TABLE special_holidays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    holiday_date DATE NOT NULL UNIQUE,
    holiday_name VARCHAR(100),
    is_open BOOLEAN DEFAULT FALSE,
    open_time TIME,
    close_time TIME,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_special_holidays_holiday_date ON special_holidays(holiday_date);

CREATE TRIGGER set_updated_at_special_holidays
BEFORE UPDATE ON special_holidays
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ────────────────────────────────────────
-- 22. お知らせテーブル
-- ────────────────────────────────────────
CREATE TABLE notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(100) NOT NULL,
    content TEXT,
    priority notice_priority DEFAULT 'low',
    status notice_status DEFAULT 'published',
    category VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notices_status ON notices(status);
CREATE INDEX idx_notices_priority ON notices(priority);
CREATE INDEX idx_notices_created_at ON notices(created_at DESC);

CREATE TRIGGER set_updated_at_notices
BEFORE UPDATE ON notices
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ────────────────────────────────────────
-- 23. タグテーブル
-- ────────────────────────────────────────
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label VARCHAR(50) UNIQUE NOT NULL
);

CREATE INDEX idx_tags_label ON tags(label);

-- ────────────────────────────────────────
-- 24. システム設定テーブル
-- ────────────────────────────────────────
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50),
    category VARCHAR(50),
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_system_settings_setting_key ON system_settings(setting_key);
CREATE INDEX idx_system_settings_category ON system_settings(category);

CREATE TRIGGER set_updated_at_system_settings
BEFORE UPDATE ON system_settings
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================
-- 初期データ挿入（オプション）
-- ============================================

-- 営業時間の初期データ（月曜〜日曜）
INSERT INTO business_hours (day_of_week, is_open, open_time, close_time) VALUES
(0, TRUE, '09:00', '18:00'),  -- 日曜
(1, TRUE, '09:00', '18:00'),  -- 月曜
(2, TRUE, '09:00', '18:00'),  -- 火曜
(3, FALSE, NULL, NULL),       -- 水曜（定休日）
(4, TRUE, '09:00', '18:00'),  -- 木曜
(5, TRUE, '09:00', '18:00'),  -- 金曜
(6, TRUE, '09:00', '18:00');  -- 土曜

-- 利用規約の初期データ
INSERT INTO terms (content) VALUES
('里山ドッグランの利用規約です。こちらに同意の上、ご利用ください。');

-- ============================================
-- コメント
-- ============================================
COMMENT ON TABLE users IS 'ユーザー情報';
COMMENT ON TABLE admin_users IS '管理者ユーザー情報';
COMMENT ON TABLE admin_logs IS '管理者操作ログ';
COMMENT ON TABLE applications IS '登録申請';
COMMENT ON TABLE dogs IS '犬プロフィール';
COMMENT ON TABLE vaccination_records IS 'ワクチン接種記録';
COMMENT ON TABLE entry_logs IS '入退場ログ';
COMMENT ON TABLE events IS 'イベント情報';
COMMENT ON TABLE event_registrations IS 'イベント登録';
COMMENT ON TABLE posts IS '投稿';
COMMENT ON TABLE post_images IS '投稿画像';
COMMENT ON TABLE comments IS 'コメント';
COMMENT ON TABLE likes IS 'いいね';
COMMENT ON TABLE bookmarks IS 'ブックマーク';
COMMENT ON TABLE business_hours IS '営業時間';
COMMENT ON TABLE special_holidays IS '特別営業日';
COMMENT ON TABLE notices IS 'お知らせ';
