"""
ダッシュボード関連のルーター
"""
from fastapi import APIRouter, Depends
from datetime import date

from routers.shared import get_db, get_current_admin_user
from db_control.models import (
    User as DbUser, Dog as DbDog, Post as DbPost, Event as DbEvent,
    Application, ApplicationStatus, Notice
)
from schemas import DashboardStatsResponse

router = APIRouter(prefix="/admin/dashboard", tags=["ダッシュボード"])


@router.get("/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """ダッシュボード統計情報取得"""
    total_users = db.query(DbUser).count()
    total_dogs = db.query(DbDog).count()
    pending_applications = db.query(Application).filter(
        Application.status == ApplicationStatus.pending
    ).count()
    # Post.statusが存在しない場合は、pending_postsは0とする
    pending_posts = 0  # TODO: Postモデルにstatusフィールドが追加されたら更新
    total_events = db.query(DbEvent).count()
    active_events = db.query(DbEvent).filter(
        DbEvent.event_date >= date.today()
    ).count()
    total_notices = db.query(Notice).count()
    published_notices = total_notices  # announcementsテーブルにはstatusカラムがないため、全件を公開済みとして扱う
    
    return DashboardStatsResponse(
        total_users=total_users,
        total_dogs=total_dogs,
        pending_applications=pending_applications,
        pending_posts=pending_posts,
        total_events=total_events,
        active_events=active_events,
        total_notices=total_notices,
        published_notices=published_notices
    )

