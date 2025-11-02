"""
ユーザー認証関連のルーター
"""
from fastapi import APIRouter, HTTPException, Depends, Form, File, UploadFile
from sqlalchemy.orm import Session
from datetime import date, datetime
from pathlib import Path
from typing import Optional
import shutil
from uuid import uuid4

from routers.shared import get_db
from auth import create_access_token, verify_password, get_password_hash
from exceptions import SatoyamaDogrunException, AuthenticationError, ConflictError, NotFoundError, FileUploadError
from db_control.models import User as DbUser, Application, ApplicationStatus
from schemas import LoginRequest, ApplicationStatusResponse

# アップロード用ディレクトリの定義（main.pyから移動）
VACCINE_CERTIFICATE_UPLOAD_DIR = Path("uploads") / "vaccine_certificates"
VACCINE_CERTIFICATE_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

router = APIRouter(prefix="/auth", tags=["認証"])


@router.post("/apply", response_model=ApplicationStatusResponse)
async def apply_registration(
    db: Session = Depends(get_db),
    email: str = Form(...),
    password: str = Form(...),
    fullName: str = Form(...),
    phoneNumber: str = Form(...),
    postalCode: str = Form(...),
    prefecture: str = Form(...),
    city: str = Form(...),
    street: str = Form(...),
    building: Optional[str] = Form(None),
    imabariResidency: str = Form(...),
    dogName: str = Form(...),
    dogBreed: str = Form(...),
    dogAge: Optional[int] = Form(None),
    dogGender: Optional[str] = Form(None),
    dogWeight: str = Form(...),
    applicationDate: date = Form(...),
    vaccine_certificate: UploadFile = File(...)
):
    """新規利用申請（ユーザー登録申請）- FormData対応"""
    try:
        # メールアドレスの重複チェック
        existing_user = db.query(DbUser).filter(DbUser.email == email).first()
        if existing_user:
            raise ConflictError("このメールアドレスは既に登録されています")

        # 既存申請の確認
        existing_application = db.query(Application).filter(
            Application.user_email == email,
            Application.status == ApplicationStatus.pending
        ).first()
        if existing_application:
            raise ConflictError("このメールアドレスで申請処理中です")
            
        # ワクチン証明書の保存
        file_extension = Path(vaccine_certificate.filename).suffix
        certificate_filename = f"{uuid4()}{file_extension}"
        certificate_path = VACCINE_CERTIFICATE_UPLOAD_DIR / certificate_filename
        
        try:
            with certificate_path.open("wb") as buffer:
                shutil.copyfileobj(vaccine_certificate.file, buffer)
        except Exception as file_error:
            from exceptions import FileUploadError
            raise FileUploadError(f"ファイルのアップロードに失敗しました: {str(file_error)}")
        finally:
            vaccine_certificate.file.close()
        
        certificate_url = f"/uploads/vaccine_certificates/{certificate_filename}"

        # 姓と名を分割
        name_parts = fullName.split(' ', 1)
        last_name = name_parts[0]
        first_name = name_parts[1] if len(name_parts) > 1 else ''
        
        # 住所を結合
        full_address = f"{prefecture} {city} {street} {building or ''}".strip()

        # 申請データを作成
        application = Application(
            id=str(uuid4()),
            user_id=None,
            user_email=email,
            user_password_hash=get_password_hash(password),
            user_last_name=last_name,
            user_first_name=first_name,
            user_phone=phoneNumber,
            user_address=full_address,
            user_prefecture=prefecture,
            user_city=city,
            user_postal_code=postalCode,
            dog_name=dogName,
            dog_breed=dogBreed,
            dog_weight=str(dogWeight),
            dog_age=dogAge,
            dog_gender=dogGender,
            vaccine_certificate=certificate_url,
            request_date=applicationDate,
            status=ApplicationStatus.pending,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        db.add(application)
        db.commit()
        db.refresh(application)

        return ApplicationStatusResponse(
            application_id=application.id,
            status=application.status.value,
            rejection_reason=None,
            approved_at=None,
            created_at=application.created_at
        )
    except SatoyamaDogrunException as e:
        db.rollback()
        raise HTTPException(
            status_code=e.status_code,
            detail=e.message
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"申請処理中にエラーが発生しました: {str(e)}")


@router.get("/application-status/{application_id}", response_model=ApplicationStatusResponse)
async def get_application_status(application_id: str, db=Depends(get_db)):
    """申請状況の確認"""
    try:
        application = db.query(Application).filter(Application.id == application_id).first()
        if not application:
            raise NotFoundError("申請", application_id)
        
        return ApplicationStatusResponse(
            application_id=application.id,
            status=application.status.value,
            rejection_reason=application.rejection_reason,
            approved_at=application.approved_at,
            created_at=application.created_at
        )
    except SatoyamaDogrunException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.message
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"申請状況取得中にエラーが発生しました: {str(e)}")


@router.post("/login")
async def login(request: LoginRequest, db=Depends(get_db)):
    """ログイン"""
    try:
        user = db.query(DbUser).filter(DbUser.email == request.email).first()
        if not user or not verify_password(request.password, user.password_hash):
            raise AuthenticationError("メールアドレスまたはパスワードが正しくありません")
        
        access_token = create_access_token(data={"sub": user.email})
        return {"access_token": access_token, "token_type": "bearer"}
    except SatoyamaDogrunException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.message
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ログイン処理中にエラーが発生しました: {str(e)}")


@router.post("/forgot-password")
async def forgot_password(email: str, db=Depends(get_db)):
    """パスワードリセット"""
    try:
        user = db.query(DbUser).filter(DbUser.email == email).first()
        if not user:
            raise NotFoundError("ユーザー", email)
        
        # 実際の実装ではメール送信処理を行う
        return {"message": "パスワードリセットメールを送信しました"}
    except SatoyamaDogrunException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail=e.message
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"パスワードリセット処理中にエラーが発生しました: {str(e)}")

