#!/usr/bin/env python3
"""
管理者パスワード更新スクリプト（Supabase版）
"""

import sys
import os

# 親ディレクトリをパスに追加
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from supabase_client import supabase_service

def update_admin_password():
    """管理者パスワードを更新"""

    print("=" * 60)
    print("管理者パスワード更新")
    print("=" * 60)
    print()

    admin_email = "admin@satoyama-dogrun.com"
    new_password = "admin2025!"

    try:
        # メールアドレスからユーザーを検索
        print(f"管理者アカウントを検索中: {admin_email}")

        users = supabase_service.auth.admin.list_users()
        admin_user = None

        for user in users:
            if user.email == admin_email:
                admin_user = user
                break

        if not admin_user:
            print(f"❌ エラー: {admin_email} が見つかりません")
            return 1

        user_id = admin_user.id
        print(f"✓ ユーザーID: {user_id}")

        # パスワードを更新
        print(f"\nパスワードを更新中...")

        supabase_service.auth.admin.update_user_by_id(
            user_id,
            {
                "password": new_password
            }
        )

        print("✓ パスワード更新成功")

        print("\n" + "=" * 60)
        print("✅ 管理者パスワードが更新されました！")
        print("=" * 60)
        print()
        print("ログイン情報:")
        print(f"  Email:    {admin_email}")
        print(f"  Password: {new_password}")
        print()

        return 0

    except Exception as e:
        print(f"\n❌ エラー: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(update_admin_password())






