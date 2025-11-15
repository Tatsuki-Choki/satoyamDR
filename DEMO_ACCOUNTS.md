# デモアカウント情報

## 管理者アカウント

### Super Admin
```
Email:    admin@satoyama-dogrun.com
Password: admin2025!
Role:     super_admin
```

**権限:**
- すべてのユーザー情報の閲覧・編集
- 投稿・コメントの管理
- イベントの作成・管理
- お知らせの作成・管理
- 申請の承認・却下
- 営業時間の設定
- 利用規約の管理

---

## 一般ユーザーアカウント

### ユーザー1: 田中太郎
```
Email:    tanaka.taro@example.com
Password: Test123!
```

### ユーザー2: 鈴木花子
```
Email:    suzuki.hanako@example.com
Password: Test123!
```

### ユーザー3: 山田次郎
```
Email:    yamada.jiro@example.com
Password: Test123!
```

**権限:**
- 自分のプロフィール編集
- 犬の登録・編集
- ドッグラン申請
- 投稿の作成・編集・削除（自分の投稿のみ）
- コメントの投稿
- いいね・ブックマーク
- イベントの閲覧
- お知らせの閲覧

---

## 使用方法

### 管理者画面へのアクセス

1. フロントエンドを起動
   ```bash
   cd satoyama_dogrun_frontend-main
   npm run dev
   ```

2. ブラウザで http://localhost:3000/admin にアクセス

3. 管理者アカウントでログイン

### 一般ユーザー画面へのアクセス

1. フロントエンドを起動（同上）

2. ブラウザで http://localhost:3000 にアクセス

3. 一般ユーザーアカウントでログイン

---

## セキュリティに関する注意

⚠️ **重要**: これらは**デモ用のアカウント**です。

- 本番環境では使用しないでください
- 本番環境では強力なパスワードを設定してください
- 本番環境では定期的にパスワードを変更してください
- デモ終了後は、これらのアカウントを削除することを推奨します

---

## アカウント削除方法

デモ終了後、以下のスクリプトでアカウントを削除できます：

```python
# delete_demo_accounts.py
from supabase_client import supabase_service

# 削除するメールアドレスのリスト
demo_emails = [
    "admin@satoyama-dogrun.com",
    "tanaka.taro@example.com",
    "suzuki.hanako@example.com",
    "yamada.jiro@example.com"
]

for email in demo_emails:
    # Supabase Authからユーザーを取得
    users = supabase_service.auth.admin.list_users()
    for user in users:
        if user.email == email:
            # ユーザー削除（カスケード削除により関連データも削除）
            supabase_service.auth.admin.delete_user(user.id)
            print(f"削除完了: {email}")
            break
```

---

## 追加のテストデータ

必要に応じて、以下のスクリプトで追加のテストデータを作成できます：

```bash
# 犬のデータを追加
python3 db_control/create_demo_dogs.py

# 投稿データを追加
python3 db_control/create_demo_posts.py

# イベントデータを追加
python3 db_control/create_demo_events.py
```

---

## トラブルシューティング

### ログインできない場合

1. メールアドレスとパスワードが正確か確認
2. ブラウザのキャッシュをクリア
3. Supabase Dashboardでユーザーの状態を確認

### エラーが発生する場合

1. Supabaseプロジェクトが稼働しているか確認
2. 環境変数（.env）が正しく設定されているか確認
3. RLSポリシーが正しく適用されているか確認

---

## サポート

問題が発生した場合は、`SUPABASE_MIGRATION_GUIDE.md` のトラブルシューティングセクションを参照してください。
