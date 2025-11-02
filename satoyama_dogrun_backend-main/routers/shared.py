"""
共通の依存関係とユーティリティ
"""
from database import get_db
from auth import get_current_user, get_current_admin_user

__all__ = ["get_db", "get_current_user", "get_current_admin_user"]

