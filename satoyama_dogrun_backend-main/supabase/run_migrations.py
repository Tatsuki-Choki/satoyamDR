#!/usr/bin/env python3
"""
Supabase マイグレーション実行スクリプト
"""
import os
import sys
import psycopg2
from pathlib import Path
import urllib.parse

# プロジェクト設定
PROJECT_REF = "xxlgbwnoqatpprixmslc"
DB_PASSWORD = "uN9*sW!6kZ3D"
DB_USER = "postgres"
DB_NAME = "postgres"
DB_HOST = f"db.{PROJECT_REF}.supabase.co"
DB_PORT = 5432

# パスワードをURLエンコード
encoded_password = urllib.parse.quote_plus(DB_PASSWORD)

# 接続文字列
DATABASE_URL = f"postgresql://{DB_USER}:{encoded_password}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# マイグレーションファイルのディレクトリ
MIGRATIONS_DIR = Path(__file__).parent / "migrations"

# マイグレーションファイルのリスト（実行順）
MIGRATION_FILES = [
    "001_initial_schema.sql",
    "002_rls_policies.sql",
    "003_storage_setup.sql",
]


def run_migration(conn, migration_file: Path):
    """マイグレーションファイルを実行"""
    print(f"\n{'='*60}")
    print(f"実行中: {migration_file.name}")
    print(f"{'='*60}")

    with open(migration_file, 'r', encoding='utf-8') as f:
        sql = f.read()

    try:
        with conn.cursor() as cur:
            # 複数のSQLステートメントを実行
            cur.execute(sql)
            conn.commit()
            print(f"✅ {migration_file.name} の実行が完了しました")
            return True
    except Exception as e:
        conn.rollback()
        print(f"❌ エラー: {migration_file.name}")
        print(f"   {str(e)}")
        return False


def main():
    print("="*60)
    print("Supabase マイグレーション実行")
    print("="*60)
    print(f"プロジェクト: {PROJECT_REF}")
    print(f"データベース: {DB_HOST}:{DB_PORT}/{DB_NAME}")
    print()

    # マイグレーションディレクトリの確認
    if not MIGRATIONS_DIR.exists():
        print(f"❌ マイグレーションディレクトリが見つかりません: {MIGRATIONS_DIR}")
        sys.exit(1)

    # データベースに接続
    print("データベースに接続中...")
    try:
        conn = psycopg2.connect(DATABASE_URL)
        print("✅ データベース接続成功")
    except Exception as e:
        print(f"❌ データベース接続エラー: {e}")
        sys.exit(1)

    try:
        # 各マイグレーションファイルを実行
        success_count = 0
        for migration_file_name in MIGRATION_FILES:
            migration_file = MIGRATIONS_DIR / migration_file_name

            if not migration_file.exists():
                print(f"⚠️  ファイルが見つかりません: {migration_file}")
                continue

            if run_migration(conn, migration_file):
                success_count += 1
            else:
                print("\n❌ マイグレーション実行中にエラーが発生しました")
                print("   既に実行済みのSQLは適用されています")
                break

        print("\n" + "="*60)
        print(f"マイグレーション完了: {success_count}/{len(MIGRATION_FILES)} 件成功")
        print("="*60)

        # テーブル一覧を取得
        print("\n作成されたテーブル一覧:")
        with conn.cursor() as cur:
            cur.execute("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                ORDER BY table_name;
            """)
            tables = cur.fetchall()
            for i, (table_name,) in enumerate(tables, 1):
                print(f"  {i:2d}. {table_name}")

        # ストレージバケット一覧を取得
        print("\n作成されたストレージバケット:")
        with conn.cursor() as cur:
            cur.execute("""
                SELECT name, public
                FROM storage.buckets
                ORDER BY name;
            """)
            buckets = cur.fetchall()
            if buckets:
                for name, is_public in buckets:
                    visibility = "公開" if is_public else "非公開"
                    print(f"  - {name} ({visibility})")
            else:
                print("  （バケットが見つかりませんでした）")

    finally:
        conn.close()
        print("\n✅ データベース接続を閉じました")


if __name__ == "__main__":
    main()
