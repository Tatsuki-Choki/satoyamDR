#!/usr/bin/env python3
"""
デモ用管理者アカウント作成スクリプト

Supabase Authを使用して管理者アカウントを作成します。
"""

import sys
import os

# 親ディレクトリをパスに追加
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from supabase_client import supabase_service

def create_demo_admin():
    """デモ用管理者アカウントを作成"""

    print("=" * 60)
    print("デモ用管理者アカウント作成")
    print("=" * 60)
    print()

    # 管理者情報
    admin_email = "admin@satoyama-dogrun.com"
    admin_password = "Admin123!"
    admin_name = "管理者"

    print(f"Email: {admin_email}")
    print(f"Password: {admin_password}")
    print(f"Name: {admin_name}")
    print()

    try:
        # Supabase Authでユーザーを作成
        print("1. Supabase Authでユーザーを作成中...")

        auth_response = supabase_service.auth.admin.create_user({
            "email": admin_email,
            "password": admin_password,
            "email_confirm": True,  # メール確認をスキップ
            "user_metadata": {
                "name": admin_name
            }
        })

        user_id = auth_response.user.id
        print(f"   ✓ ユーザー作成成功: {user_id}")

        # admin_usersテーブルに登録
        print("\n2. admin_usersテーブルに登録中...")

        admin_data = {
            'id': user_id,
            'email': admin_email,
            'name': admin_name,
            'role': 'super_admin',
            'is_active': True
        }

        result = supabase_service.table('admin_users').insert(admin_data).execute()
        print(f"   ✓ 管理者登録成功")

        print("\n" + "=" * 60)
        print("✅ デモ用管理者アカウントが作成されました！")
        print("=" * 60)
        print()
        print("ログイン情報:")
        print(f"  Email:    {admin_email}")
        print(f"  Password: {admin_password}")
        print()
        print("このアカウントで管理者画面にログインできます。")
        print()

        return 0

    except Exception as e:
        error_message = str(e)

        # ユーザーが既に存在する場合
        if "User already registered" in error_message or "already registered" in error_message.lower():
            print("\n⚠️  このメールアドレスは既に登録されています。")
            print("\n既存のユーザーをadmin_usersに追加しますか？")

            try:
                # 既存ユーザーを取得
                print("\n既存ユーザーのIDを取得中...")

                # メールアドレスからユーザーを検索
                users = supabase_service.auth.admin.list_users()
                existing_user = None

                for user in users:
                    if user.email == admin_email:
                        existing_user = user
                        break

                if existing_user:
                    user_id = existing_user.id
                    print(f"   ✓ ユーザーID: {user_id}")

                    # admin_usersに登録
                    print("\nadmin_usersテーブルに登録中...")

                    admin_data = {
                        'id': user_id,
                        'email': admin_email,
                        'name': admin_name,
                        'role': 'super_admin',
                        'is_active': True
                    }

                    # 既存レコードがある場合はupsert
                    result = supabase_service.table('admin_users')\
                        .upsert(admin_data, on_conflict='id')\
                        .execute()

                    print("   ✓ 管理者登録成功")

                    print("\n" + "=" * 60)
                    print("✅ 既存ユーザーを管理者として登録しました！")
                    print("=" * 60)
                    print()
                    print("ログイン情報:")
                    print(f"  Email:    {admin_email}")
                    print(f"  Password: (既存のパスワードを使用)")
                    print()

                    return 0
                else:
                    print("❌ ユーザーが見つかりませんでした")
                    return 1

            except Exception as e2:
                print(f"\n❌ エラー: {e2}")
                return 1
        else:
            print(f"\n❌ エラー: {error_message}")
            import traceback
            traceback.print_exc()
            return 1


if __name__ == "__main__":
    sys.exit(create_demo_admin())
