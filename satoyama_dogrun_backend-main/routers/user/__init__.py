"""
ユーザー側ルーターの統合
"""
from fastapi import APIRouter

from routers.user import auth, profile, posts, events, entry

# ユーザー側のルーターを統合
user_router = APIRouter()

user_router.include_router(auth.router)
user_router.include_router(profile.router)
user_router.include_router(posts.router)
user_router.include_router(events.router)
user_router.include_router(entry.router)
