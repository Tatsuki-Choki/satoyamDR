# Supabase移行ガイド

## 概要

このドキュメントは、Satoyama DogrunアプリケーションのデータベースをSQLite/Azure MySQLからSupabaseに移行するための完全なガイドです。

## 移行ステータス

### ✅ 完了したタスク

1. **要件定義書作成** - Supabase移行の要件を詳細に定義
2. **移行計画策定** - 5フェーズの移行計画を作成
3. **Supabaseプロジェクト初期セットアップ** - プロジェクトID: `xxlgbwnoqatpprixmslc`
4. **環境変数設定** - バックエンド・フロントエンド両方
5. **データベーススキーマ移行** - 25テーブルの作成
6. **RLSポリシー実装** - すべてのテーブルにセキュリティポリシーを適用
7. **Storage設定** - 3つのバケット（avatars, posts, vaccine-certificates）
8. **Supabase Python Client統合** - バックエンドAPI
9. **Supabase JS SDK統合** - フロントエンド
10. **認証システム更新** - Supabase Authへの移行
11. **データフェッチフック作成** - React hooks for Supabase

### 🔄 進行中のタスク

1. **既存データの移行** - 移行スクリプト作成済み（実行待ち）

### 📋 残りのタスク

1. **テストとデバッグ** - すべての機能の動作確認
2. **本番環境デプロイ**

---

## アーキテクチャ

### データベース構造

```
Supabase PostgreSQL (25 テーブル)
├── ユーザー管理
│   ├── users (一般ユーザー)
│   ├── admin_users (管理者)
│   └── admin_logs (管理者操作ログ)
├── ドッグラン申請
│   ├── applications (申請)
│   ├── dogs (犬情報)
│   └── vaccination_records (ワクチン記録)
├── 入退場管理
│   └── entry_logs
├── イベント
│   └── events
├── SNS機能
│   ├── posts (投稿)
│   ├── comments (コメント)
│   ├── likes (いいね)
│   └── bookmarks (ブックマーク)
├── 施設情報
│   ├── business_hours (営業時間)
│   └── notices (お知らせ)
└── その他
    └── terms (利用規約)
```

### Storage構造

```
Supabase Storage
├── avatars/ (公開バケット)
│   └── {user_id}/{filename}
├── posts/ (公開バケット)
│   └── {user_id}/{post_id}/{filename}
└── vaccine-certificates/ (非公開バケット)
    └── {user_id}/{dog_id}/{vaccination_id}.{ext}
```

---

## セットアップ手順

### 1. 環境変数の設定

#### バックエンド (.env)

```bash
# Supabase Configuration
SUPABASE_URL=https://xxlgbwnoqatpprixmslc.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
ENVIRONMENT=development
```

#### フロントエンド (.env.local)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxlgbwnoqatpprixmslc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

⚠️ **重要**: `SUPABASE_SERVICE_ROLE_KEY`は**絶対に**フロントエンドに含めないでください！

### 2. 依存関係のインストール

#### バックエンド

```bash
cd satoyama_dogrun_backend-main
pip install supabase
```

#### フロントエンド

```bash
cd satoyama_dogrun_frontend-main
npm install @supabase/supabase-js
```

### 3. データベースマイグレーション確認

すべてのマイグレーションは既に適用済みです：

- ✅ `001_initial_schema.sql` - 25テーブル作成
- ✅ `002_rls_policies.sql` - RLSポリシー
- ✅ `003_storage_setup.sql` - Storageバケット
- ✅ `004_helper_functions.sql` - ヘルパー関数とトリガー

確認方法：

```bash
cd satoyama_dogrun_backend-main
python3 supabase/verify_migration_simple.py
```

---

## データ移行

### 既存データの移行

```bash
cd satoyama_dogrun_backend-main
python3 migrate_data_to_supabase.py
```

このスクリプトは以下を実行します：

1. SQLiteデータベース（`satoyama_dogrun.db`）からデータを読み込み
2. Supabaseスキーマに合わせてデータを変換
3. Supabaseに挿入

**移行されるテーブル：**

- ✅ users
- ✅ dogs
- ✅ posts
- ✅ comments
- ✅ likes
- ✅ applications

---

## 使用方法

### バックエンド (Python)

#### 基本的な使用例

```python
from supabase_client import supabase_service

# データ取得
result = supabase_service.table('users').select('*').limit(10).execute()
users = result.data

# データ挿入
new_user = {
    'email': 'test@example.com',
    'name': 'Test User'
}
result = supabase_service.table('users').insert(new_user).execute()

# データ更新
result = supabase_service.table('users')\
    .update({'name': 'Updated Name'})\
    .eq('id', user_id)\
    .execute()

# データ削除
result = supabase_service.table('users')\
    .delete()\
    .eq('id', user_id)\
    .execute()
```

#### ファイルアップロード

```python
# アバター画像をアップロード
file_path = 'path/to/avatar.jpg'
with open(file_path, 'rb') as f:
    result = supabase_service.storage\
        .from_('avatars')\
        .upload(f'{user_id}/avatar.jpg', f)

# 公開URLを取得
url = supabase_service.storage\
    .from_('avatars')\
    .get_public_url(f'{user_id}/avatar.jpg')
```

### フロントエンド (TypeScript/React)

#### 認証

```typescript
import { useUserAuth } from '@/contexts/UserAuthContext';

function LoginComponent() {
  const { signIn, user } = useUserAuth();

  const handleLogin = async (email: string, password: string) => {
    const { error } = await signIn(email, password);
    if (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    // UI code
  );
}
```

#### データフェッチ

```typescript
import { usePosts, useUserDogs } from '@/hooks/useSupabase';

function PostsPage() {
  const { data: posts, loading, error, refetch } = usePosts(20, 0);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {posts?.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

#### ファイルアップロード

```typescript
import { uploadAvatar, uploadPostImages } from '@/lib/supabase/storage';

// アバター画像をアップロード
const handleAvatarUpload = async (file: File) => {
  const url = await uploadAvatar(userId, file);
  console.log('Avatar uploaded:', url);
};

// 投稿画像をアップロード
const handlePostImages = async (files: File[]) => {
  const urls = await uploadPostImages(userId, postId, files);
  console.log('Images uploaded:', urls);
};
```

#### リアルタイムサブスクリプション

```typescript
import { useRealtimeSubscription } from '@/hooks/useSupabase';

function PostsPage() {
  useRealtimeSubscription('posts', undefined, (payload) => {
    console.log('New post:', payload);
    // UIを更新
  });

  return <div>Posts with realtime updates</div>;
}
```

---

## セキュリティ

### Row Level Security (RLS)

すべてのテーブルにRLSポリシーが適用されています：

#### ユーザーテーブル

- ✅ 自分のデータは読み書き可能
- ✅ 他のユーザーは読み取り専用
- ✅ 管理者はすべて操作可能

#### 投稿テーブル

- ✅ 公開投稿は誰でも読み取り可能
- ✅ 自分の投稿は編集・削除可能
- ✅ 管理者はすべて操作可能

#### 管理者テーブル

- ✅ 管理者のみアクセス可能
- ✅ `is_admin()`関数で権限確認

### ストレージポリシー

#### avatars (公開)

- ✅ 誰でも読み取り可能
- ✅ 認証済みユーザーのみアップロード可能

#### posts (公開)

- ✅ 誰でも読み取り可能
- ✅ 認証済みユーザーのみアップロード可能

#### vaccine-certificates (非公開)

- ✅ 飼い主と管理者のみアクセス可能
- ✅ 署名付きURLで期限付きアクセス

---

## トラブルシューティング

### マイグレーション検証エラー

```bash
# 簡易検証
python3 supabase/verify_migration_simple.py

# 詳細検証
python3 supabase/verify_migration.py
```

### RLSポリシーのテスト

```sql
-- Supabase SQL Editorで実行
-- 管理者権限確認
SELECT public.is_admin();

-- ユーザーデータアクセステスト
SELECT * FROM users LIMIT 1;
```

### Storage接続テスト

```python
from supabase_client import supabase_service

# バケット一覧取得
buckets = supabase_service.storage.list_buckets()
print(buckets)
```

---

## パフォーマンス最適化

### インデックス

主要なインデックスは自動作成されます：

- `users.email` - ユニークインデックス
- `posts.user_id` - 外部キーインデックス
- `comments.post_id` - 外部キーインデックス
- `likes.post_id, user_id` - 複合ユニークインデックス

### クエリ最適化のヒント

```typescript
// ❌ 避けるべき：大量のデータを一度に取得
const { data } = await supabase.from('posts').select('*').execute();

// ✅ 推奨：ページネーションを使用
const { data } = await supabase
  .from('posts')
  .select('*')
  .range(0, 19)
  .execute();

// ✅ 推奨：必要なフィールドのみ選択
const { data } = await supabase
  .from('posts')
  .select('id, content, user_id, users(name, avatar_url)')
  .execute();
```

---

## 本番環境への移行

### チェックリスト

- [ ] すべてのマイグレーションが完了
- [ ] データ移行が完了
- [ ] RLSポリシーのテスト完了
- [ ] 認証フローのテスト完了
- [ ] ファイルアップロードのテスト完了
- [ ] パフォーマンステスト完了
- [ ] バックアップ戦略の確立
- [ ] モニタリング設定

### 本番環境の環境変数

```bash
# バックエンド
SUPABASE_URL=https://xxlgbwnoqatpprixmslc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[本番用キー]
ENVIRONMENT=production

# フロントエンド
NEXT_PUBLIC_SUPABASE_URL=https://xxlgbwnoqatpprixmslc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[本番用anonキー]
```

---

## サポート

### ドキュメント

- [Supabase公式ドキュメント](https://supabase.com/docs)
- [Supabase Python Client](https://github.com/supabase-community/supabase-py)
- [Supabase JS Client](https://github.com/supabase/supabase-js)

### よくある質問

**Q: RLSポリシーをバイパスしたい場合は？**

A: バックエンドでは`supabase_service`（service_roleキー）を使用してください。フロントエンドでは絶対にservice_roleキーを使用しないでください。

**Q: ファイルサイズの制限は？**

A: デフォルトでは50MBです。Supabase Dashboardで変更可能です。

**Q: データベース接続数の制限は？**

A: Freeプランでは60接続、Proプランでは200接続です。Connection Poolingを使用することを推奨します。

---

## 更新履歴

- 2025-11-16: 初版作成
  - データベーススキーマ移行完了
  - RLSポリシー実装完了
  - Storage設定完了
  - フロントエンド・バックエンド統合完了
  - データ移行スクリプト作成完了
