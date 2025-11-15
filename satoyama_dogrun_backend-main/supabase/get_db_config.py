#!/usr/bin/env python3
"""
Supabase プロジェクトのデータベース接続情報を取得
"""
import requests
import json

PROJECT_REF = "xxlgbwnoqatpprixmslc"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4bGdid25vcWF0cHByaXhtc2xjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzIwNDEzOSwiZXhwIjoyMDc4NzgwMTM5fQ.vedsBeTzhlYmfC8Bfmlublp8ymA-W2mJigbtVTnUPVY"
SUPABASE_URL = f"https://{PROJECT_REF}.supabase.co"

# プロジェクトのメタデータを取得
headers = {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json"
}

print("Supabase プロジェクト接続情報")
print("=" * 60)
print(f"Project Reference: {PROJECT_REF}")
print(f"Supabase URL: {SUPABASE_URL}")
print()

# データベース接続情報を推測
# Supabaseのデータベース接続は通常以下のパターン：
# 新しいアーキテクチャ（Pooler）: aws-0-{region}.pooler.supabase.com
# 直接接続: db.{project_ref}.supabase.co（古いパターン）

print("推測されるデータベース接続情報：")
print("-" * 60)

# パターン1: Connection Pooling（推奨）
print("\n1. Connection Pooling（推奨）:")
print("   ホスト: aws-0-ap-northeast-1.pooler.supabase.com")
print("   ポート: 6543")
print("   データベース: postgres")
print("   ユーザー: postgres.[PROJECT_REF]")
print("   パスワード: [既に取得済み]")

# パターン2: 直接接続
print("\n2. 直接接続:")
print(f"   ホスト: db.{PROJECT_REF}.supabase.co")
print("   ポート: 5432")
print("   データベース: postgres")
print("   ユーザー: postgres")
print("   パスワード: [既に取得済み]")

print("\n" + "=" * 60)
print("\n推奨される接続方法：")
print("Supabase Dashboard > Settings > Database で正しい接続情報を確認してください。")
print("\nまたは、以下のコマンドで直接SQLファイルを実行できます：")
print("\n1. Connection Pooling経由（トライアル）:")
pooling_cmd = f'PGPASSWORD="uN9*sW!6kZ3D" psql -h aws-0-ap-northeast-1.pooler.supabase.com -p 6543 -U postgres.{PROJECT_REF} -d postgres -f supabase/migrations/001_initial_schema.sql'
print(f"   {pooling_cmd}")

print("\n2. 直接接続経由（トライアル）:")
direct_cmd = f'PGPASSWORD="uN9*sW!6kZ3D" psql -h db.{PROJECT_REF}.supabase.co -p 5432 -U postgres -d postgres -f supabase/migrations/001_initial_schema.sql'
print(f"   {direct_cmd}")

print("\n" + "=" * 60)
print("\n注意：正確な接続情報はSupabase Dashboardで確認してください。")
