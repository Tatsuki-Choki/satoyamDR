#!/usr/bin/env python3
"""
Supabase マイグレーション実行スクリプト（Management API版）
"""
import os
import sys
import requests
from pathlib import Path
from dotenv import load_dotenv

# 環境変数を読み込み
load_dotenv()

# プロジェクト設定
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://xxlgbwnoqatpprixmslc.supabase.co")
SUPABASE_SERVICE_ROLE_KEY = os.getenv(
    "SUPABASE_SERVICE_ROLE_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4bGdid25vcWF0cHByaXhtc2xjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzIwNDEzOSwiZXhwIjoyMDc4NzgwMTM5fQ.vedsBeTzhlYmfC8Bfmlublp8ymA-W2mJigbtVTnUPVY"
)

# PostgREST API エンドポイント
POSTGREST_URL = f"{SUPABASE_URL}/rest/v1/rpc"

# マイグレーションファイルのディレクトリ
MIGRATIONS_DIR = Path(__file__).parent / "migrations"

# マイグレーションファイルのリスト（実行順）
MIGRATION_FILES = [
    "001_initial_schema.sql",
    "002_rls_policies.sql",
    "003_storage_setup.sql",
]


def execute_sql(sql_statements: str) -> dict:
    """
    SupabaseのPostgREST API経由でSQLを実行

    注意: PostgRESTはSELECTクエリを想定しているため、
    DDL (CREATE TABLE等) を直接実行することはできません。

    代わりに、Supabase Python Clientで直接接続するか、
    psqlコマンドを使用する必要があります。
    """
    # この方法は実際には動作しないため、別のアプローチが必要
    raise NotImplementedError(
        "PostgREST APIではDDL文を直接実行できません。\n"
        "代わりに、以下の方法を使用してください：\n"
        "1. Supabase Dashboard の SQL Editor\n"
        "2. psql コマンド\n"
        "3. Supabase CLI (supabase db push)\n"
    )


def main():
    print("="*60)
    print("Supabase マイグレーション実行（API版）")
    print("="*60)
    print(f"Supabase URL: {SUPABASE_URL}")
    print()

    # マイグレーションディレクトリの確認
    if not MIGRATIONS_DIR.exists():
        print(f"❌ マイグレーションディレクトリが見つかりません: {MIGRATIONS_DIR}")
        sys.exit(1)

    print("⚠️  PostgREST API経由ではDDL文を実行できません。")
    print("\n以下の方法でマイグレーションを実行してください：\n")

    print("方法1: Supabase Dashboard の SQL Editor")
    print("-" * 60)
    print(f"1. https://supabase.com/dashboard/project/xxlgbwnoqatpprixmslc を開く")
    print("2. 左サイドバーから「SQL Editor」をクリック")
    print("3. 以下のファイルを順番に実行：")
    for i, filename in enumerate(MIGRATION_FILES, 1):
        filepath = MIGRATIONS_DIR / filename
        print(f"   {i}. {filepath}")

    print("\n方法2: psql コマンド")
    print("-" * 60)
    print("以下のコマンドを実行：\n")

    for filename in MIGRATION_FILES:
        filepath = MIGRATIONS_DIR / filename
        print(f"psql \"postgresql://postgres:uN9*sW!6kZ3D@db.xxlgbwnoqatpprixmslc.supabase.co:5432/postgres\" -f {filepath}")

    print("\n方法3: Supabase CLI")
    print("-" * 60)
    print("以下のコマンドを実行：\n")
    print("supabase db push --db-url \"postgresql://postgres:uN9*sW!6kZ3D@db.xxlgbwnoqatpprixmslc.supabase.co:5432/postgres\"")

    print("\n" + "="*60)


if __name__ == "__main__":
    main()
