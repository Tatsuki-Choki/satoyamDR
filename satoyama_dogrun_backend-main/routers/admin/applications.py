"""
申請管理関連のルーター
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime, date
from uuid import uuid4
from sqlalchemy import func

from routers.shared import get_db, get_current_admin_user
from auth import log_admin_action
from exceptions import SatoyamaDogrunException, NotFoundError, ConflictError, ValidationError
from db_control.models import (
    Application, ApplicationStatus, User as DbUser, Dog as DbDog
)
from schemas import (
    ApplicationResponse, ApplicationUpdateRequest
)

router = APIRouter(prefix="/admin/applications", tags=["申請管理"])


@router.get("", response_model=List[ApplicationResponse])
async def get_applications(
    status: Optional[str] = None,
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """申請一覧取得"""
    query = db.query(Application)
    
    if status:
        query = query.filter(Application.status == status)
    
    applications = query.order_by(Application.created_at.desc()).all()
    
    responses = []
    for app in applications:
        # 申請データから直接情報を取得（user_idはNullの可能性がある）
        user_name = f"{app.user_last_name} {app.user_first_name}"
        
        responses.append(ApplicationResponse(
            id=app.id,
            user_id=app.user_id,  # Noneの場合もある
            user_name=user_name,
            user_email=app.user_email,
            user_phone=app.user_phone,
            dog_name=app.dog_name,
            dog_breed=app.dog_breed,
            dog_weight=app.dog_weight,
            vaccine_certificate=app.vaccine_certificate,
            request_date=app.request_date,
            request_time=app.request_time,
            status=app.status,
            admin_notes=app.admin_notes,
            approved_by=app.approved_by,
            approved_at=app.approved_at,
            rejection_reason=app.rejection_reason,
            created_at=app.created_at,
            updated_at=app.updated_at
        ))
    
    return responses


@router.get("/stats")
async def get_applications_stats(
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """申請統計取得"""
    total = db.query(func.count(Application.id)).scalar()
    pending = db.query(func.count(Application.id)).filter(Application.status == "pending").scalar()
    approved = db.query(func.count(Application.id)).filter(Application.status == "approved").scalar()
    rejected = db.query(func.count(Application.id)).filter(Application.status == "rejected").scalar()
    
    # 今日の申請数
    today = datetime.utcnow().date()
    today_count = db.query(func.count(Application.id)).filter(
        func.date(Application.created_at) == today
    ).scalar()
    
    return {
        "total": total,
        "pending": pending,
        "approved": approved,
        "rejected": rejected,
        "today": today_count
    }


@router.get("/{application_id}", response_model=ApplicationResponse)
async def get_application(
    application_id: str,
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """申請詳細取得"""
    try:
        application = db.query(Application).filter(Application.id == application_id).first()
        if not application:
            raise NotFoundError("申請", application_id)
        
        user = db.query(DbUser).filter(DbUser.id == application.user_id).first()
        user_name = f"{user.last_name} {user.first_name}" if user else "不明"
        
        return ApplicationResponse(
            id=application.id,
            user_id=application.user_id,
            user_name=user_name,
            user_email=user.email if user else "",
            user_phone=user.phone_number if user else "",
            dog_name=application.dog_name,
            dog_breed=application.dog_breed,
            dog_weight=application.dog_weight,
            vaccine_certificate=application.vaccine_certificate,
            request_date=application.request_date,
            request_time=application.request_time,
            status=application.status,
            admin_notes=application.admin_notes,
            approved_by=application.approved_by,
            approved_at=application.approved_at,
            rejection_reason=application.rejection_reason,
            created_at=application.created_at,
            updated_at=application.updated_at
        )
    except SatoyamaDogrunException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.message
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"申請詳細取得中にエラーが発生しました: {str(e)}")


@router.put("/{application_id}/approve")
async def approve_application(
    application_id: str,
    request: ApplicationUpdateRequest,
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """申請承認"""
    try:
        application = db.query(Application).filter(Application.id == application_id).first()
        if not application:
            raise NotFoundError("申請", application_id)
        
        # 既に承認済みの場合はエラー
        if application.status == ApplicationStatus.approved:
            raise ConflictError("この申請は既に承認されています")
        
        # 新規申請の場合（user_idがNULL）、ユーザーを作成
        if application.user_id is None and application.user_email:
            # メールアドレスの重複チェック
            existing_user = db.query(DbUser).filter(DbUser.email == application.user_email).first()
            if existing_user:
                raise ConflictError("このメールアドレスは既に登録されています")
            
            # ユーザー作成（申請時に保存したハッシュ値を使用）
            if not application.user_password_hash:
                raise ValidationError("申請データにパスワードハッシュが存在しません")
            
            new_user = DbUser(
                id=str(uuid4()),
                email=application.user_email,
                password_hash=application.user_password_hash,
                last_name=application.user_last_name,
                first_name=application.user_first_name,
                phone_number=application.user_phone,
                address=application.user_address,
                prefecture=application.user_prefecture,
                city=application.user_city,
                created_at=datetime.utcnow()
            )
            db.add(new_user)
            db.flush()
            
            # 犬情報も同時に登録
            if application.dog_name:
                new_dog = DbDog(
                    id=str(uuid4()),
                    owner_id=new_user.id,
                    name=application.dog_name,
                    breed=application.dog_breed,
                    birthday_at=date.today(),
                    gender=application.dog_gender,
                    created_at=datetime.utcnow()
                )
                db.add(new_dog)
            
            # applicationのuser_idを更新
            application.user_id = new_user.id
        
        # 申請ステータスを承認に更新
        application.status = ApplicationStatus.approved
        application.admin_notes = request.admin_notes
        application.approved_by = current_admin.id
        application.approved_at = datetime.utcnow()
        application.updated_at = datetime.utcnow()
        
        db.commit()
        
        # 管理者ログを記録
        await log_admin_action(
            admin_user_id=current_admin.id,
            action="application_approved",
            target_type="application",
            target_id=application_id,
            details=f"申請を承認しました: {request.admin_notes or 'なし'}",
            db=db
        )
        
        return {"message": "申請を承認し、ユーザーを作成しました"}
    except SatoyamaDogrunException as e:
        db.rollback()
        raise HTTPException(
            status_code=e.status_code,
            detail=e.message
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"申請承認処理中にエラーが発生しました: {str(e)}")


@router.put("/{application_id}/reject")
async def reject_application(
    application_id: str,
    request: ApplicationUpdateRequest,
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """申請却下"""
    try:
        application = db.query(Application).filter(Application.id == application_id).first()
        if not application:
            raise NotFoundError("申請", application_id)
        
        # 既に処理済みの場合はエラー
        if application.status != ApplicationStatus.pending:
            raise ConflictError("この申請は既に処理されています")
        
        application.status = ApplicationStatus.rejected
        application.admin_notes = request.admin_notes
        application.rejection_reason = request.rejection_reason
        application.approved_by = current_admin.id
        application.approved_at = datetime.utcnow()
        application.updated_at = datetime.utcnow()
        
        db.commit()
        
        # 管理者ログを記録
        await log_admin_action(
            admin_user_id=current_admin.id,
            action="application_rejected",
            target_type="application",
            target_id=application_id,
            details=f"申請を却下しました: {request.admin_notes or 'なし'}",
            db=db
        )
        
        return {"message": "申請を却下しました"}
    except SatoyamaDogrunException as e:
        db.rollback()
        raise HTTPException(
            status_code=e.status_code,
            detail=e.message
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"申請却下処理中にエラーが発生しました: {str(e)}")

