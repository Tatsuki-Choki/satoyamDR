#!/usr/bin/env python3
"""
SQLite → Supabase データ移行スクリプト

既存のSQLiteデータベースからSupabaseへデータを移行します。
"""

import sqlite3
import sys
import os
import argparse
from datetime import datetime
from typing import Dict, List, Any, Optional
import uuid
from pathlib import Path

# supabase_clientをインポート
from supabase_client import supabase_service

# ============================================================================
# 設定
# ============================================================================
SQLITE_DB_PATH = "satoyama_dogrun.db"
UPLOADS_DIR = "uploads"

# ============================================================================
# UUID生成ヘルパー
# ============================================================================
def ensure_uuid(value: Any) -> str:
    """
    値がUUID形式であることを保証
    """
    if value is None:
        return str(uuid.uuid4())

    value_str = str(value)

    # 既にUUID形式の場合はそのまま返す
    if len(value_str) == 36 and value_str.count('-') == 4:
        return value_str

    # UUID v4を生成
    return str(uuid.uuid4())


# ============================================================================
# テーブルマッピング
# ============================================================================
def map_user_data(row: Dict[str, Any]) -> Dict[str, Any]:
    """ユーザーデータをSupabaseスキーマにマッピング"""
    return {
        'id': ensure_uuid(row.get('id')),
        'email': row.get('email'),
        'name': row.get('name') or row.get('username', 'Unknown'),
        'phone_number': row.get('phone_number'),
        'avatar_url': row.get('avatar_url'),
        'bio': row.get('bio'),
        'is_active': bool(row.get('is_active', True)),
        'email_verified': bool(row.get('email_verified', False)),
        'phone_verified': bool(row.get('phone_verified', False)),
        'created_at': row.get('created_at') or datetime.utcnow().isoformat(),
        'updated_at': row.get('updated_at') or datetime.utcnow().isoformat(),
    }


def map_dog_data(row: Dict[str, Any]) -> Dict[str, Any]:
    """犬データをSupabaseスキーマにマッピング"""
    return {
        'id': ensure_uuid(row.get('id')),
        'user_id': ensure_uuid(row.get('user_id')),
        'name': row.get('name'),
        'breed': row.get('breed') or 'Unknown',
        'size': row.get('size') or 'medium',
        'gender': row.get('gender') or 'unknown',
        'birth_date': row.get('birth_date'),
        'weight': row.get('weight'),
        'color': row.get('color'),
        'personality': row.get('personality'),
        'medical_notes': row.get('medical_notes'),
        'is_neutered': bool(row.get('is_neutered', False)),
        'registration_number': row.get('registration_number'),
        'avatar_url': row.get('avatar_url'),
        'is_active': bool(row.get('is_active', True)),
        'created_at': row.get('created_at') or datetime.utcnow().isoformat(),
        'updated_at': row.get('updated_at') or datetime.utcnow().isoformat(),
    }


def map_post_data(row: Dict[str, Any]) -> Dict[str, Any]:
    """投稿データをSupabaseスキーマにマッピング"""
    # image_urlsをリストに変換（カンマ区切りの場合）
    image_urls = row.get('image_urls')
    if isinstance(image_urls, str) and image_urls:
        image_urls = [url.strip() for url in image_urls.split(',')]
    elif not image_urls:
        image_urls = None

    return {
        'id': ensure_uuid(row.get('id')),
        'user_id': ensure_uuid(row.get('user_id')),
        'content': row.get('content') or '',
        'image_urls': image_urls,
        'status': row.get('status') or 'published',
        'is_public': bool(row.get('is_public', True)),
        'likes_count': row.get('likes_count') or 0,
        'comments_count': row.get('comments_count') or 0,
        'published_at': row.get('published_at') or row.get('created_at'),
        'created_at': row.get('created_at') or datetime.utcnow().isoformat(),
        'updated_at': row.get('updated_at') or datetime.utcnow().isoformat(),
    }


# ============================================================================
# データ取得関数
# ============================================================================
def get_sqlite_data(table_name: str) -> List[Dict[str, Any]]:
    """SQLiteからデータを取得"""
    conn = sqlite3.connect(SQLITE_DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    try:
        cursor.execute(f"SELECT * FROM {table_name}")
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    except sqlite3.OperationalError as e:
        print(f"  ⚠️  テーブル {table_name} が見つかりません: {e}")
        return []
    finally:
        conn.close()


# ============================================================================
# データ移行関数
# ============================================================================
def migrate_users():
    """ユーザーデータを移行"""
    print("\n" + "=" * 60)
    print("ユーザーデータ移行")
    print("=" * 60)

    rows = get_sqlite_data('users')
    print(f"  SQLiteから {len(rows)} 件のユーザーを取得")

    if not rows:
        print("  移行するデータがありません")
        return

    migrated = 0
    for row in rows:
        try:
            user_data = map_user_data(row)

            # Supabaseに挿入
            result = supabase_service.table('users').insert(user_data).execute()
            migrated += 1
            print(f"  ✓ {user_data['email']}")
        except Exception as e:
            print(f"  ❌ {row.get('email')}: {e}")

    print(f"\n移行完了: {migrated}/{len(rows)} 件")


def migrate_dogs():
    """犬データを移行"""
    print("\n" + "=" * 60)
    print("犬データ移行")
    print("=" * 60)

    rows = get_sqlite_data('dogs')
    print(f"  SQLiteから {len(rows)} 件の犬データを取得")

    if not rows:
        print("  移行するデータがありません")
        return

    migrated = 0
    for row in rows:
        try:
            dog_data = map_dog_data(row)

            # Supabaseに挿入
            result = supabase_service.table('dogs').insert(dog_data).execute()
            migrated += 1
            print(f"  ✓ {dog_data['name']}")
        except Exception as e:
            print(f"  ❌ {row.get('name')}: {e}")

    print(f"\n移行完了: {migrated}/{len(rows)} 件")


def migrate_posts():
    """投稿データを移行"""
    print("\n" + "=" * 60)
    print("投稿データ移行")
    print("=" * 60)

    rows = get_sqlite_data('posts')
    print(f"  SQLiteから {len(rows)} 件の投稿を取得")

    if not rows:
        print("  移行するデータがありません")
        return

    migrated = 0
    for row in rows:
        try:
            post_data = map_post_data(row)

            # Supabaseに挿入
            result = supabase_service.table('posts').insert(post_data).execute()
            migrated += 1
            print(f"  ✓ 投稿ID: {post_data['id'][:8]}...")
        except Exception as e:
            print(f"  ❌ 投稿ID {row.get('id')}: {e}")

    print(f"\n移行完了: {migrated}/{len(rows)} 件")


def migrate_comments():
    """コメントデータを移行"""
    print("\n" + "=" * 60)
    print("コメントデータ移行")
    print("=" * 60)

    rows = get_sqlite_data('comments')
    print(f"  SQLiteから {len(rows)} 件のコメントを取得")

    if not rows:
        print("  移行するデータがありません")
        return

    migrated = 0
    for row in rows:
        try:
            comment_data = {
                'id': ensure_uuid(row.get('id')),
                'post_id': ensure_uuid(row.get('post_id')),
                'user_id': ensure_uuid(row.get('user_id')),
                'content': row.get('content') or '',
                'created_at': row.get('created_at') or datetime.utcnow().isoformat(),
                'updated_at': row.get('updated_at') or datetime.utcnow().isoformat(),
            }

            # Supabaseに挿入
            result = supabase_service.table('comments').insert(comment_data).execute()
            migrated += 1
            print(f"  ✓ コメントID: {comment_data['id'][:8]}...")
        except Exception as e:
            print(f"  ❌ コメントID {row.get('id')}: {e}")

    print(f"\n移行完了: {migrated}/{len(rows)} 件")


def migrate_likes():
    """いいねデータを移行"""
    print("\n" + "=" * 60)
    print("いいねデータ移行")
    print("=" * 60)

    rows = get_sqlite_data('likes')
    print(f"  SQLiteから {len(rows)} 件のいいねを取得")

    if not rows:
        print("  移行するデータがありません")
        return

    migrated = 0
    for row in rows:
        try:
            like_data = {
                'id': ensure_uuid(row.get('id')),
                'post_id': ensure_uuid(row.get('post_id')),
                'user_id': ensure_uuid(row.get('user_id')),
                'created_at': row.get('created_at') or datetime.utcnow().isoformat(),
            }

            # Supabaseに挿入
            result = supabase_service.table('likes').insert(like_data).execute()
            migrated += 1
        except Exception as e:
            print(f"  ❌ いいねID {row.get('id')}: {e}")

    print(f"\n移行完了: {migrated}/{len(rows)} 件")


def migrate_applications():
    """申請データを移行"""
    print("\n" + "=" * 60)
    print("申請データ移行")
    print("=" * 60)

    rows = get_sqlite_data('applications')
    print(f"  SQLiteから {len(rows)} 件の申請を取得")

    if not rows:
        print("  移行するデータがありません")
        return

    migrated = 0
    for row in rows:
        try:
            app_data = {
                'id': ensure_uuid(row.get('id')),
                'user_id': ensure_uuid(row.get('user_id')),
                'dog_id': ensure_uuid(row.get('dog_id')),
                'agree_to_terms': bool(row.get('agree_to_terms', True)),
                'status': row.get('status') or 'pending',
                'reviewed_by': ensure_uuid(row.get('reviewed_by')) if row.get('reviewed_by') else None,
                'reviewed_at': row.get('reviewed_at'),
                'rejection_reason': row.get('rejection_reason'),
                'notes': row.get('notes'),
                'created_at': row.get('created_at') or datetime.utcnow().isoformat(),
                'updated_at': row.get('updated_at') or datetime.utcnow().isoformat(),
            }

            # Supabaseに挿入
            result = supabase_service.table('applications').insert(app_data).execute()
            migrated += 1
            print(f"  ✓ 申請ID: {app_data['id'][:8]}...")
        except Exception as e:
            print(f"  ❌ 申請ID {row.get('id')}: {e}")

    print(f"\n移行完了: {migrated}/{len(rows)} 件")


# ============================================================================
# メイン処理
# ============================================================================
def main():
    # コマンドライン引数のパース
    parser = argparse.ArgumentParser(description='SQLite → Supabase データ移行')
    parser.add_argument('--yes', '-y', action='store_true', help='確認なしで実行')
    args = parser.parse_args()

    print("\n" + "=" * 60)
    print("SQLite → Supabase データ移行")
    print("=" * 60)

    # SQLiteデータベースの存在確認
    if not os.path.exists(SQLITE_DB_PATH):
        print(f"\n❌ エラー: {SQLITE_DB_PATH} が見つかりません")
        return 1

    print(f"\nSQLiteデータベース: {SQLITE_DB_PATH}")
    print(f"Supabaseプロジェクト: {os.getenv('SUPABASE_URL')}")

    # 確認プロンプト（--yesフラグがない場合のみ）
    if not args.yes:
        try:
            response = input("\n移行を開始しますか？ (yes/no): ")
            if response.lower() not in ['yes', 'y']:
                print("移行をキャンセルしました")
                return 0
        except EOFError:
            print("\n❌ インタラクティブモードではありません。--yes フラグを使用してください")
            return 1
    else:
        print("\n自動実行モード: 移行を開始します...")

    # データ移行実行
    try:
        migrate_users()
        migrate_dogs()
        migrate_posts()
        migrate_comments()
        migrate_likes()
        migrate_applications()

        print("\n" + "=" * 60)
        print("✅ すべてのデータ移行が完了しました！")
        print("=" * 60)

        print("\n次のステップ:")
        print("  1. Supabase Dashboardでデータを確認")
        print("  2. フロントエンドの動作確認")
        print("  3. RLSポリシーのテスト")

        return 0

    except Exception as e:
        print(f"\n❌ エラーが発生しました: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
