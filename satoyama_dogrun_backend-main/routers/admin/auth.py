"""
管理者認証関連のルーター
"""
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime

from routers.shared import get_db
from auth import (
    get_current_admin_user, create_admin_access_token, verify_password
)
from exceptions import SatoyamaDogrunException, AuthenticationError
from db_control.models import AdminUser
from schemas import AdminLoginRequest, AdminLoginResponse, AdminUserResponse

router = APIRouter(prefix="/admin/auth", tags=["管理者認証"])


@router.post("/login", response_model=AdminLoginResponse)
async def admin_login(
    request: AdminLoginRequest,
    db=Depends(get_db)
):
    """管理者ログイン"""
    try:
        admin_user = db.query(AdminUser).filter(
            AdminUser.email == request.email,
            AdminUser.is_active == True
        ).first()
        
        if not admin_user or not verify_password(request.password, admin_user.password_hash):
            raise AuthenticationError("メールアドレスまたはパスワードが正しくありません")
        
        # 最終ログイン時刻を更新
        admin_user.last_login = datetime.utcnow()
        db.commit()
        
        # 管理者用アクセストークンを作成
        access_token = create_admin_access_token(data={"sub": admin_user.email})
        
        return AdminLoginResponse(
            access_token=access_token,
            token_type="bearer",
            admin_user=AdminUserResponse(
                id=admin_user.id,
                email=admin_user.email,
                last_name=admin_user.last_name,
                first_name=admin_user.first_name,
                role=admin_user.role,
                is_active=admin_user.is_active,
                last_login=admin_user.last_login,
                created_at=admin_user.created_at,
                updated_at=admin_user.updated_at
            )
        )
    except SatoyamaDogrunException as e:
        db.rollback()
        raise HTTPException(
            status_code=e.status_code,
            detail=e.message
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"管理者ログイン処理中にエラーが発生しました: {str(e)}")


@router.get("/me", response_model=AdminUserResponse)
async def get_current_admin_info(
    current_admin = Depends(get_current_admin_user)
):
    """現在の管理者情報取得"""
    return AdminUserResponse(
        id=current_admin.id,
        email=current_admin.email,
        last_name=current_admin.last_name,
        first_name=current_admin.first_name,
        role=current_admin.role,
        is_active=current_admin.is_active,
        last_login=current_admin.last_login,
        created_at=current_admin.created_at,
        updated_at=current_admin.updated_at
    )

