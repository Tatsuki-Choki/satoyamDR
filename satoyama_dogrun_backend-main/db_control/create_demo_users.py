#!/usr/bin/env python3
"""
デモ用一般ユーザーアカウント作成スクリプト

Supabase Authを使用してテスト用の一般ユーザーを作成します。
"""

import sys
import os

# 親ディレクトリをパスに追加
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from supabase_client import supabase_service

def create_demo_users():
    """デモ用一般ユーザーを作成"""

    print("=" * 60)
    print("デモ用一般ユーザーアカウント作成")
    print("=" * 60)
    print()

    # ユーザー情報
    demo_users = [
        {
            "email": "tanaka.taro@example.com",
            "password": "Test123!",
            "name": "田中太郎",
            "phone_number": "090-1234-5678"
        },
        {
            "email": "suzuki.hanako@example.com",
            "password": "Test123!",
            "name": "鈴木花子",
            "phone_number": "090-2345-6789"
        },
        {
            "email": "yamada.jiro@example.com",
            "password": "Test123!",
            "name": "山田次郎",
            "phone_number": "090-3456-7890"
        }
    ]

    created_count = 0
    skipped_count = 0

    for user_data in demo_users:
        email = user_data["email"]
        password = user_data["password"]
        name = user_data["name"]
        phone = user_data.get("phone_number")

        print(f"\n📧 {name} ({email})")

        try:
            # Supabase Authでユーザーを作成
            auth_response = supabase_service.auth.admin.create_user({
                "email": email,
                "password": password,
                "email_confirm": True,  # メール確認をスキップ
                "user_metadata": {
                    "name": name
                }
            })

            user_id = auth_response.user.id
            print(f"   ✓ Auth作成成功: {user_id}")

            # usersテーブルに登録
            user_record = {
                'id': user_id,
                'email': email,
                'name': name,
                'phone_number': phone,
                'is_active': True,
                'email_verified': True
            }

            result = supabase_service.table('users').insert(user_record).execute()
            print(f"   ✓ ユーザー登録成功")

            created_count += 1

        except Exception as e:
            error_message = str(e)

            if "User already registered" in error_message or "already registered" in error_message.lower():
                print(f"   ⚠️  既に登録済み（スキップ）")
                skipped_count += 1
            else:
                print(f"   ❌ エラー: {error_message}")

    print("\n" + "=" * 60)
    print(f"作成: {created_count} 件、スキップ: {skipped_count} 件")
    print("=" * 60)
    print()

    if created_count > 0:
        print("✅ デモ用ユーザーアカウントが作成されました！")
        print()
        print("共通パスワード: Test123!")
        print()
        print("作成されたユーザー:")
        for user_data in demo_users:
            print(f"  - {user_data['name']} ({user_data['email']})")
        print()

    return 0


if __name__ == "__main__":
    sys.exit(create_demo_users())
