from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv
import uuid

from database import get_db
from db_control.models import User, AdminUser, AdminLog

# Supabaseクライアントをインポート
try:
    from supabase_client import supabase_service
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False

load_dotenv()

# 設定
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY or SECRET_KEY == "your-secret-key-here-change-this-in-production":
    raise ValueError(
        "SECRET_KEYが設定されていません。環境変数SECRET_KEYを設定してください。"
        "本番環境では強力なランダムな文字列を使用してください。"
    )
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
ADMIN_ACCESS_TOKEN_EXPIRE_MINUTES = 60  # 管理者は長めの有効期限

# パスワードハッシュ化
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# セキュリティ
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """パスワードの検証"""
    try:
        # bcryptの72バイト制限に対応
        password_bytes = plain_password.encode('utf-8')
        if len(password_bytes) > 72:
            plain_password = password_bytes[:72].decode('utf-8', errors='ignore')
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        # passlibでエラーが発生した場合、bcryptを直接使用
        import bcrypt
        try:
            password_bytes = plain_password.encode('utf-8')
            if len(password_bytes) > 72:
                password_bytes = password_bytes[:72]
            return bcrypt.checkpw(password_bytes, hashed_password.encode('utf-8'))
        except Exception:
            return False

def get_password_hash(password: str) -> str:
    """パスワードのハッシュ化"""
    try:
        # bcryptの72バイト制限に対応
        password_bytes = password.encode('utf-8')
        if len(password_bytes) > 72:
            password = password_bytes[:72].decode('utf-8', errors='ignore')
        return pwd_context.hash(password)
    except Exception as e:
        # passlibでエラーが発生した場合、bcryptを直接使用
        import bcrypt
        password_bytes = password.encode('utf-8')
        if len(password_bytes) > 72:
            password_bytes = password_bytes[:72]
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password_bytes, salt).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """アクセストークンの作成"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_admin_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """管理者用アクセストークンの作成"""
    to_encode = data.copy()
    to_encode.update({"type": "admin"})  # 管理者トークンであることを示す
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ADMIN_ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    """トークンの検証"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def verify_supabase_token(token: str) -> Optional[dict]:
    """Supabaseトークンの検証"""
    if not SUPABASE_AVAILABLE:
        return None

    try:
        # Supabaseのgetユーザー機能を使ってトークンを検証
        result = supabase_service.auth.get_user(token)
        if result and result.user:
            return {
                "sub": result.user.id,  # user_id
                "email": result.user.email,
                "type": "supabase"
            }
        return None
    except Exception as e:
        print(f"Supabase token verification error: {e}")
        return None

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """現在のユーザーを取得"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="認証に失敗しました",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        payload = verify_token(token)
        if payload is None:
            raise credentials_exception
        
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    
    return user

async def get_current_admin_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> AdminUser:
    """現在の管理者ユーザーを取得（Supabase Auth対応）"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="管理者認証に失敗しました",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        token = credentials.credentials
        payload = None
        user_id = None

        # まずSupabaseトークンとして検証を試みる
        if SUPABASE_AVAILABLE:
            payload = verify_supabase_token(token)
            if payload:
                user_id = payload.get("sub")  # Supabaseの場合はuser_id

        # Supabaseトークンでない場合は、カスタムJWTとして検証
        if payload is None:
            payload = verify_token(token)
            if payload is None:
                raise credentials_exception

            # カスタムJWTの場合は管理者トークンかチェック
            token_type = payload.get("type")
            if token_type != "admin":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="管理者権限が必要です"
                )

            email = payload.get("sub")
            if email is None:
                raise credentials_exception

            # emailからadmin_userを検索
            admin_user = db.query(AdminUser).filter(
                AdminUser.email == email,
                AdminUser.is_active == True
            ).first()
        else:
            # Supabaseトークンの場合はuser_idで検索
            if user_id is None:
                raise credentials_exception

            # Supabaseを使って直接admin_usersテーブルから取得
            try:
                result = supabase_service.table('admin_users')\
                    .select('*')\
                    .eq('id', user_id)\
                    .eq('is_active', True)\
                    .single()\
                    .execute()

                if not result.data:
                    raise credentials_exception

                # Supabaseのデータを使って仮のAdminUserオブジェクトを作成
                admin_data = result.data
                admin_user = type('AdminUser', (), {
                    'id': admin_data['id'],
                    'email': admin_data['email'],
                    'name': admin_data['name'],
                    'role': type('Role', (), {'value': admin_data['role']})(),
                    'is_active': admin_data['is_active']
                })()
            except Exception as e:
                print(f"Error fetching admin user from Supabase: {e}")
                raise credentials_exception

    except JWTError:
        raise credentials_exception

    if admin_user is None:
        raise credentials_exception

    return admin_user

async def get_current_admin_user_with_role(
    required_role: str,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> AdminUser:
    """指定された権限を持つ現在の管理者ユーザーを取得"""
    admin_user = await get_current_admin_user(credentials, db)
    
    # 権限チェック
    if required_role == "super_admin" and admin_user.role.value != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="スーパー管理者権限が必要です"
        )
    elif required_role == "admin" and admin_user.role.value not in ["super_admin", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="管理者権限が必要です"
        )
    
    return admin_user

async def log_admin_action(
    admin_user_id: str,
    action: str,
    target_type: Optional[str] = None,
    target_id: Optional[str] = None,
    details: Optional[str] = None,
    request: Optional[Request] = None,
    db: Session = Depends(get_db)
):
    """管理者の操作をログに記録"""
    try:
        ip_address = None
        user_agent = None
        
        if request:
            ip_address = request.client.host if request.client else None
            user_agent = request.headers.get("user-agent")
        
        admin_log = AdminLog(
            id=str(uuid.uuid4()),
            admin_user_id=admin_user_id,
            action=action,
            target_type=target_type,
            target_id=target_id,
            details=details,
            ip_address=ip_address,
            user_agent=user_agent,
            created_at=datetime.utcnow()
        )
        
        db.add(admin_log)
        db.commit()
        
    except Exception as e:
        # ログ記録に失敗しても処理は続行
        print(f"Admin log recording failed: {e}")
        pass 