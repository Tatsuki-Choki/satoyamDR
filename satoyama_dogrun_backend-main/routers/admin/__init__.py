"""
管理側ルーターの統合
"""
from fastapi import APIRouter

from routers.admin import auth, applications, dashboard, users, events, posts, settings

# 管理側のルーターを統合
admin_router = APIRouter()

admin_router.include_router(auth.router)
admin_router.include_router(applications.router)
admin_router.include_router(dashboard.router)
admin_router.include_router(users.router)
admin_router.include_router(events.router)
admin_router.include_router(posts.router)
admin_router.include_router(settings.router)
