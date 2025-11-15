#!/usr/bin/env python3
"""
Supabase マイグレーション検証スクリプト（簡易版）
"""
import sys
import os

# 親ディレクトリをパスに追加
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from supabase_client import supabase_service

def verify_data_access():
    """各テーブルにアクセスできるか確認"""
    print("=" * 60)
    print("テーブルアクセス確認")
    print("=" * 60 + "\n")

    tables_to_test = [
        'users', 'admin_users', 'admin_logs', 'applications',
        'dogs', 'vaccination_records', 'entry_logs', 'events',
        'posts', 'comments', 'likes', 'bookmarks',
        'business_hours', 'notices', 'terms'
    ]

    success_count = 0
    for table in tables_to_test:
        try:
            result = supabase_service.table(table).select('*').limit(1).execute()
            print(f"  ✓ {table}")
            success_count += 1
        except Exception as e:
            print(f"  ❌ {table}: {e}")

    print(f"\n成功: {success_count}/{len(tables_to_test)}")

    return success_count == len(tables_to_test)


def verify_initial_data():
    """初期データが正しく投入されているか確認"""
    print("\n" + "=" * 60)
    print("初期データ確認")
    print("=" * 60 + "\n")

    # 営業時間
    try:
        business_hours = supabase_service.table('business_hours').select('*').execute()
        print(f"  ✓ 営業時間: {len(business_hours.data)} 件")
        if len(business_hours.data) == 7:
            print("    ✅ 7件の営業時間データが正常に投入されています")
        else:
            print(f"    ⚠️  期待: 7件, 実際: {len(business_hours.data)}件")
    except Exception as e:
        print(f"  ❌ 営業時間の確認エラー: {e}")

    # 利用規約
    try:
        terms = supabase_service.table('terms').select('*').execute()
        print(f"  ✓ 利用規約: {len(terms.data)} 件")
        if len(terms.data) >= 1:
            print("    ✅ 利用規約データが正常に投入されています")
        else:
            print(f"    ⚠️  期待: 1件以上, 実際: {len(terms.data)}件")
    except Exception as e:
        print(f"  ❌ 利用規約の確認エラー: {e}")


def verify_storage_buckets():
    """Storageバケットが正しく作成されているか確認"""
    print("\n" + "=" * 60)
    print("Storageバケット確認")
    print("=" * 60 + "\n")

    expected_buckets = ['avatars', 'posts', 'vaccine-certificates']

    try:
        buckets = supabase_service.storage.list_buckets()
        actual_buckets = [bucket['name'] for bucket in buckets]

        for bucket_name in expected_buckets:
            if bucket_name in actual_buckets:
                bucket_info = next((b for b in buckets if b['name'] == bucket_name), None)
                visibility = "公開" if bucket_info.get('public') else "非公開"
                print(f"  ✓ {bucket_name} ({visibility})")
            else:
                print(f"  ❌ {bucket_name} (未作成)")

        missing = set(expected_buckets) - set(actual_buckets)
        if not missing:
            print("\n✅ 全バケットが正常に作成されました")
            return True
        else:
            print(f"\n❌ 不足しているバケット: {missing}")
            return False
    except Exception as e:
        print(f"❌ エラー: {e}")
        return False


def main():
    print("\n" + "=" * 60)
    print("Supabase マイグレーション検証")
    print("=" * 60 + "\n")

    tables_ok = verify_data_access()
    verify_initial_data()
    storage_ok = verify_storage_buckets()

    print("\n" + "=" * 60)
    print("検証結果")
    print("=" * 60)

    if tables_ok and storage_ok:
        print("\n✅ すべてのマイグレーションが正常に完了しました！")
        print("\n次のステップ:")
        print("  1. バックエンドAPIの更新")
        print("  2. フロントエンドのSupabase SDK統合")
        print("  3. 既存データの移行")
        return 0
    else:
        print("\n❌ マイグレーションに問題があります")
        return 1


if __name__ == "__main__":
    sys.exit(main())
