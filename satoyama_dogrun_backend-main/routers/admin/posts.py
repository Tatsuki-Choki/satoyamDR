"""
投稿管理関連のルーター
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime
from sqlalchemy import func

from routers.shared import get_db, get_current_admin_user
from auth import log_admin_action
from db_control.models import (
    Post as DbPost, Comment as DbComment, Like as DbLike,
    PostHashtag as DbPostHashtag, User as DbUser
)
from schemas import (
    PostManagementResponse, PostStatusUpdateRequest
)

router = APIRouter(prefix="/admin/posts", tags=["投稿管理"])


@router.get("", response_model=List[PostManagementResponse])
async def get_posts_for_admin(
    status: Optional[str] = None,
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """投稿一覧取得（管理者用）"""
    query = db.query(DbPost)
    
    if status:
        query = query.filter(DbPost.status == status)
    
    posts = query.order_by(DbPost.created_at.desc()).all()
    
    if not posts:
        return []
    
    post_ids = [post.id for post in posts]
    user_ids = list(set(post.user_id for post in posts))
    
    # ユーザー情報を一括取得
    users = {u.id: u for u in db.query(DbUser).filter(DbUser.id.in_(user_ids)).all()}
    
    # いいね数とコメント数を一括取得
    comments_counts = {
        post_id: count
        for post_id, count in db.query(
            DbComment.post_id,
            func.count(DbComment.id)
        ).filter(DbComment.post_id.in_(post_ids)).group_by(DbComment.post_id).all()
    }
    
    likes_counts = {
        post_id: count
        for post_id, count in db.query(
            DbLike.post_id,
            func.count(DbLike.id)
        ).filter(DbLike.post_id.in_(post_ids)).group_by(DbLike.post_id).all()
    }
    
    responses = []
    for post in posts:
        user = users.get(post.user_id)
        user_name = f"{user.last_name} {user.first_name}" if user else "不明"
        
        responses.append(PostManagementResponse(
            id=post.id,
            user_id=post.user_id,
            user_name=user_name,
            content=post.content,
            status=post.status,
            admin_notes=post.admin_notes,
            likes_count=likes_counts.get(post.id, 0),
            comments_count=comments_counts.get(post.id, 0),
            created_at=post.created_at,
            updated_at=post.updated_at
        ))
    
    return responses


@router.get("/stats")
async def get_posts_stats(
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """投稿統計取得"""
    total = db.query(func.count(DbPost.id)).scalar()
    pending = db.query(func.count(DbPost.id)).filter(DbPost.status == "pending").scalar()
    approved = db.query(func.count(DbPost.id)).filter(DbPost.status == "approved").scalar()
    rejected = db.query(func.count(DbPost.id)).filter(DbPost.status == "rejected").scalar()
    reported = db.query(func.count(DbPost.id)).filter(DbPost.status == "reported").scalar()
    
    # 今日の投稿数
    today = datetime.utcnow().date()
    today_count = db.query(func.count(DbPost.id)).filter(
        func.date(DbPost.created_at) == today
    ).scalar()
    
    return {
        "total": total,
        "pending": pending,
        "approved": approved,
        "rejected": rejected,
        "reported": reported,
        "today": today_count
    }


@router.get("/{post_id}", response_model=PostManagementResponse)
async def get_post_detail(
    post_id: str,
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """投稿詳細取得"""
    post = db.query(DbPost).filter(DbPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="投稿が見つかりません")
    
    user = db.query(DbUser).filter(DbUser.id == post.user_id).first()
    user_name = f"{user.last_name} {user.first_name}" if user else "不明"
    
    likes_count = db.query(DbLike).filter(DbLike.post_id == post.id).count()
    comments_count = db.query(DbComment).filter(DbComment.post_id == post.id).count()
    
    return PostManagementResponse(
        id=post.id,
        user_id=post.user_id,
        user_name=user_name,
        content=post.content,
        status=post.status,
        admin_notes=post.admin_notes,
        likes_count=likes_count,
        comments_count=comments_count,
        created_at=post.created_at,
        updated_at=post.updated_at
    )


@router.put("/{post_id}/status")
async def update_post_status(
    post_id: str,
    request: PostStatusUpdateRequest,
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """投稿ステータス更新"""
    post = db.query(DbPost).filter(DbPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="投稿が見つかりません")
    
    post.status = request.status
    post.admin_notes = request.admin_notes
    post.updated_at = datetime.utcnow()
    
    db.commit()
    
    # 管理者ログを記録
    await log_admin_action(
        admin_user_id=current_admin.id,
        action="post_status_updated",
        target_type="post",
        target_id=post_id,
        details=f"投稿ステータスを{request.status}に更新: {request.admin_notes or 'なし'}",
        db=db
    )
    
    return {"message": "投稿ステータスを更新しました"}


@router.delete("/{post_id}")
async def delete_post(
    post_id: str,
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """投稿削除"""
    post = db.query(DbPost).filter(DbPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="投稿が見つかりません")
    
    # 関連データも削除
    db.query(DbComment).filter(DbComment.post_id == post_id).delete()
    db.query(DbLike).filter(DbLike.post_id == post_id).delete()
    db.query(DbPostHashtag).filter(DbPostHashtag.post_id == post_id).delete()
    
    db.delete(post)
    db.commit()
    
    # 管理者ログを記録
    await log_admin_action(
        admin_user_id=current_admin.id,
        action="post_deleted",
        target_type="post",
        target_id=post_id,
        details=f"投稿を削除",
        db=db
    )
    
    return {"message": "投稿を削除しました"}


@router.put("/{post_id}/hide")
async def hide_post(
    post_id: str,
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """投稿非表示"""
    post = db.query(DbPost).filter(DbPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="投稿が見つかりません")
    
    post.status = "rejected"
    post.updated_at = datetime.utcnow()
    
    db.commit()
    
    # 管理者ログを記録
    await log_admin_action(
        admin_user_id=current_admin.id,
        action="post_hidden",
        target_type="post",
        target_id=post_id,
        details=f"投稿を非表示",
        db=db
    )
    
    return {"message": "投稿を非表示にしました"}


@router.put("/{post_id}/show")
async def show_post(
    post_id: str,
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """投稿表示"""
    post = db.query(DbPost).filter(DbPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="投稿が見つかりません")
    
    post.status = "approved"
    post.updated_at = datetime.utcnow()
    
    db.commit()
    
    # 管理者ログを記録
    await log_admin_action(
        admin_user_id=current_admin.id,
        action="post_shown",
        target_type="post",
        target_id=post_id,
        details=f"投稿を表示",
        db=db
    )
    
    return {"message": "投稿を表示しました"}


@router.get("/{post_id}/reports")
async def get_post_reports(
    post_id: str,
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """投稿報告一覧取得"""
    # TODO: 報告テーブルが存在する場合の実装
    # 現在は空のリストを返す
    return []


@router.post("/{post_id}/admin-comment")
async def add_admin_comment(
    post_id: str,
    comment: str,
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """管理者コメント追加"""
    post = db.query(DbPost).filter(DbPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="投稿が見つかりません")
    
    # admin_notesフィールドにコメントを追加
    if post.admin_notes:
        post.admin_notes = f"{post.admin_notes}\n[管理者コメント] {comment}"
    else:
        post.admin_notes = f"[管理者コメント] {comment}"
    
    post.updated_at = datetime.utcnow()
    db.commit()
    
    # 管理者ログを記録
    await log_admin_action(
        admin_user_id=current_admin.id,
        action="admin_comment_added",
        target_type="post",
        target_id=post_id,
        details=f"管理者コメントを追加",
        db=db
    )
    
    return {"message": "管理者コメントを追加しました"}

