"""
ユーザー管理関連のルーター
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime
from sqlalchemy import func

from routers.shared import get_db, get_current_admin_user
from auth import log_admin_action
from exceptions import SatoyamaDogrunException, NotFoundError
from db_control.models import User as DbUser, Dog as DbDog, Post as DbPost
from schemas import (
    UserDbResponse, UserStatsResponse, UserDetailResponse,
    UserSuspendRequest, UpdateUserDbRequest, DogDbResponse, PostManagementResponse
)

router = APIRouter(prefix="/admin/users", tags=["ユーザー管理"])


@router.get("", response_model=List[UserDbResponse])
async def get_users_for_admin(
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """ユーザー一覧取得（管理者用）"""
    users = db.query(DbUser).order_by(DbUser.created_at.desc()).all()
    return [UserDbResponse(
        id=user.id,
        email=user.email,
        last_name=user.last_name,
        first_name=user.first_name,
        address=user.address,
        phone_number=user.phone_number,
        prefecture=user.prefecture,
        city=user.city,
        created_at=user.created_at,
        updated_at=user.updated_at
    ) for user in users]


@router.get("/stats", response_model=UserStatsResponse)
async def get_users_stats(
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """ユーザー統計取得"""
    from datetime import timedelta
    
    total_users = db.query(func.count(DbUser.id)).scalar()
    
    # アクティブユーザー（最近30日以内にログイン）- 仮実装
    active_users = total_users  # TODO: ログイン履歴テーブルから計算
    
    # 停止中のユーザー - 仮実装
    suspended_users = 0  # TODO: is_suspendedフィールド追加後に実装
    
    # 今月の新規ユーザー
    today = datetime.utcnow()
    first_day_of_month = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    new_users_this_month = db.query(func.count(DbUser.id)).filter(
        DbUser.created_at >= first_day_of_month
    ).scalar()
    
    return UserStatsResponse(
        total_users=total_users,
        active_users=active_users,
        suspended_users=suspended_users,
        new_users_this_month=new_users_this_month
    )


@router.get("/{user_id}", response_model=UserDetailResponse)
async def get_user_detail(
    user_id: str,
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """ユーザー詳細取得"""
    try:
        user = db.query(DbUser).filter(DbUser.id == user_id).first()
        if not user:
            raise NotFoundError("ユーザー", user_id)
        
        # 関連データのカウント
        dogs_count = db.query(DbDog).filter(DbDog.owner_id == user_id).count()
        posts_count = db.query(DbPost).filter(DbPost.user_id == user_id).count()
        
        return UserDetailResponse(
            id=user.id,
            email=user.email,
            last_name=user.last_name,
            first_name=user.first_name,
            address=user.address,
            phone_number=user.phone_number,
            prefecture=user.prefecture,
            city=user.city,
            is_active=True,  # TODO: 実際のフィールドから取得
            is_suspended=False,  # TODO: 実際のフィールドから取得
            dogs_count=dogs_count,
            posts_count=posts_count,
            created_at=user.created_at,
            updated_at=user.updated_at
        )
    except SatoyamaDogrunException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.message
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ユーザー詳細取得中にエラーが発生しました: {str(e)}")


@router.put("/{user_id}")
async def update_user(
    user_id: str,
    request: UpdateUserDbRequest,
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """ユーザー情報更新"""
    try:
        user = db.query(DbUser).filter(DbUser.id == user_id).first()
        if not user:
            raise NotFoundError("ユーザー", user_id)
        
        if request.last_name is not None:
            user.last_name = request.last_name
        if request.first_name is not None:
            user.first_name = request.first_name
        if request.address is not None:
            user.address = request.address
        if request.phone_number is not None:
            user.phone_number = request.phone_number
        if request.prefecture is not None:
            user.prefecture = request.prefecture
        if request.city is not None:
            user.city = request.city
        
        user.updated_at = datetime.utcnow()
        db.commit()
        
        # 管理者ログを記録
        await log_admin_action(
            admin_user_id=current_admin.id,
            action="user_updated",
            target_type="user",
            target_id=user_id,
            details=f"ユーザー情報を更新: {user.email}",
            db=db
        )
        
        return {"message": "ユーザー情報を更新しました"}
    except SatoyamaDogrunException as e:
        db.rollback()
        raise HTTPException(
            status_code=e.status_code,
            detail=e.message
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"ユーザー情報更新中にエラーが発生しました: {str(e)}")


@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """ユーザー削除（論理削除）"""
    try:
        user = db.query(DbUser).filter(DbUser.id == user_id).first()
        if not user:
            raise NotFoundError("ユーザー", user_id)
        
        # 関連データの確認
        dogs_count = db.query(DbDog).filter(DbDog.owner_id == user_id).count()
        posts_count = db.query(DbPost).filter(DbPost.user_id == user_id).count()
        
        if dogs_count > 0 or posts_count > 0:
            # 物理削除ではなく論理削除を推奨
            return {"message": f"このユーザーには関連データがあります（犬: {dogs_count}件、投稿: {posts_count}件）。削除する前に確認してください。"}
        
        # 物理削除
        db.delete(user)
        db.commit()
        
        # 管理者ログを記録
        await log_admin_action(
            admin_user_id=current_admin.id,
            action="user_deleted",
            target_type="user",
            target_id=user_id,
            details=f"ユーザーを削除: {user.email}",
            db=db
        )
        
        return {"message": "ユーザーを削除しました"}
    except SatoyamaDogrunException as e:
        db.rollback()
        raise HTTPException(
            status_code=e.status_code,
            detail=e.message
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"ユーザー削除処理中にエラーが発生しました: {str(e)}")


@router.put("/{user_id}/suspend")
async def suspend_user(
    user_id: str,
    request: UserSuspendRequest,
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """ユーザー一時停止"""
    try:
        user = db.query(DbUser).filter(DbUser.id == user_id).first()
        if not user:
            raise NotFoundError("ユーザー", user_id)
        
        # TODO: 実際のis_suspendedフィールドに更新
        # user.is_suspended = True
        # user.suspension_reason = request.reason
        user.updated_at = datetime.utcnow()
        db.commit()
        
        # 管理者ログを記録
        await log_admin_action(
            admin_user_id=current_admin.id,
            action="user_suspended",
            target_type="user",
            target_id=user_id,
            details=f"ユーザーを一時停止: {request.reason}",
            db=db
        )
        
        return {"message": "ユーザーを一時停止しました"}
    except SatoyamaDogrunException as e:
        db.rollback()
        raise HTTPException(
            status_code=e.status_code,
            detail=e.message
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"ユーザー一時停止処理中にエラーが発生しました: {str(e)}")


@router.put("/{user_id}/activate")
async def activate_user(
    user_id: str,
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """ユーザー有効化"""
    try:
        user = db.query(DbUser).filter(DbUser.id == user_id).first()
        if not user:
            raise NotFoundError("ユーザー", user_id)
        
        # TODO: 実際のis_suspendedフィールドに更新
        # user.is_suspended = False
        # user.suspension_reason = None
        user.updated_at = datetime.utcnow()
        db.commit()
        
        # 管理者ログを記録
        await log_admin_action(
            admin_user_id=current_admin.id,
            action="user_activated",
            target_type="user",
            target_id=user_id,
            details=f"ユーザーを有効化",
            db=db
        )
        
        return {"message": "ユーザーを有効化しました"}
    except SatoyamaDogrunException as e:
        db.rollback()
        raise HTTPException(
            status_code=e.status_code,
            detail=e.message
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"ユーザー有効化処理中にエラーが発生しました: {str(e)}")


@router.get("/{user_id}/dogs", response_model=List[UserDbResponse])
async def get_user_dogs_admin(
    user_id: str,
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """ユーザーの犬一覧取得（管理者用）"""
    from schemas import DogDbResponse
    
    user = db.query(DbUser).filter(DbUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="ユーザーが見つかりません")
    
    dogs = db.query(DbDog).filter(DbDog.owner_id == user_id).all()
    return [
        DogDbResponse(
            id=d.id, owner_id=d.owner_id, name=d.name, breed=d.breed,
            birthday_at=d.birthday_at, gender=d.gender, personality=d.personality,
            likes=d.likes, avatar_url=d.avatar_url, created_at=d.created_at, updated_at=d.updated_at
        ) for d in dogs
    ]


@router.get("/{user_id}/posts", response_model=List[PostManagementResponse])
async def get_user_posts_admin(
    user_id: str,
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """ユーザーの投稿一覧取得（管理者用）"""
    from db_control.models import Comment as DbComment, Like as DbLike
    
    user = db.query(DbUser).filter(DbUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="ユーザーが見つかりません")
    
    posts = db.query(DbPost).filter(DbPost.user_id == user_id).order_by(DbPost.created_at.desc()).all()
    
    if not posts:
        return []
    
    post_ids = [post.id for post in posts]
    
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
    
    user_name = f"{user.last_name} {user.first_name}"
    
    responses = []
    for post in posts:
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

