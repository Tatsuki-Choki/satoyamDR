"""
Supabase Client設定
"""
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# 環境変数を読み込み
load_dotenv()

# Supabase設定
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL:
    raise ValueError("SUPABASE_URL environment variable is not set")

if not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError("SUPABASE_SERVICE_ROLE_KEY environment variable is not set")


# Service Role Client（バックエンド用 - RLSをバイパス可能）
supabase_service: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# Anon Client（フロントエンド用 - RLS適用）
supabase_anon: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY) if SUPABASE_ANON_KEY else None


def get_supabase_client(use_service_role: bool = True) -> Client:
    """
    Supabaseクライアントを取得

    Args:
        use_service_role: Trueの場合はservice_roleキーを使用（RLSバイパス）
                         Falseの場合はanonキーを使用（RLS適用）

    Returns:
        Supabaseクライアント
    """
    if use_service_role:
        return supabase_service
    else:
        if not supabase_anon:
            raise ValueError("SUPABASE_ANON_KEY is not configured")
        return supabase_anon


# エクスポート
__all__ = ["supabase_service", "supabase_anon", "get_supabase_client"]
