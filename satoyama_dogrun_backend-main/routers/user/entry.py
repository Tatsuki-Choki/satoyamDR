"""
入場管理関連のルーター
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime, timedelta
from uuid import uuid4
from sqlalchemy import func, and_
import qrcode
import io
import base64

from routers.shared import get_db, get_current_user, get_current_admin_user
from db_control.models import (
    EntryLog as DbEntryLog, EntryAction, User as DbUser, Dog as DbDog
)
from schemas import (
    QRCodeResponse, EntryRequest, EntryResponse,
    CurrentVisitorsResponse, EntryHistoryResponse
)

router = APIRouter(prefix="/entry", tags=["入場管理"])


@router.get("/qrcode", response_model=QRCodeResponse)
async def generate_qr_code(
    current_user = Depends(get_current_user),
    db=Depends(get_db)
):
    """ユーザー専用のQRコード生成"""
    # QRコードに含めるデータ（ユーザーIDと有効期限）
    expires_at = datetime.utcnow() + timedelta(minutes=5)
    qr_data = {
        "user_id": current_user.id,
        "expires_at": expires_at.isoformat()
    }
    
    # QRコード生成
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(str(qr_data))
    qr.make(fit=True)
    
    # 画像を生成してBase64エンコード
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_str = base64.b64encode(buffer.getvalue()).decode()
    
    return QRCodeResponse(
        qr_code=f"data:image/png;base64,{img_str}",
        user_id=current_user.id,
        expires_at=expires_at
    )


@router.post("/scan")
async def scan_qr_code(
    qr_data: dict,
    admin_user = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """QRコードスキャン（管理者のみ）"""
    # QRコードのデータを検証
    user_id = qr_data.get("user_id")
    expires_at_str = qr_data.get("expires_at")
    
    if not user_id or not expires_at_str:
        raise HTTPException(status_code=400, detail="無効なQRコードです")
    
    # 有効期限チェック
    expires_at = datetime.fromisoformat(expires_at_str)
    if datetime.utcnow() > expires_at:
        raise HTTPException(status_code=400, detail="QRコードの有効期限が切れています")
    
    # ユーザー確認
    user = db.query(DbUser).filter(DbUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="ユーザーが見つかりません")
    
    return {
        "user_id": user_id,
        "user_name": f"{user.last_name or ''} {user.first_name or ''}".strip(),
        "message": "QRコードを確認しました"
    }


@router.post("/enter", response_model=EntryResponse)
async def enter_dogrun(
    request: EntryRequest,
    current_user = Depends(get_current_user),
    db=Depends(get_db)
):
    """ドッグラン入場記録"""
    # 既に入場中かチェック
    last_entry = db.query(DbEntryLog).filter(
        DbEntryLog.user_id == current_user.id
    ).order_by(DbEntryLog.occurred_at.desc()).first()
    
    if last_entry and last_entry.action == EntryAction.entry:
        raise HTTPException(status_code=400, detail="既に入場中です")
    
    # 入場記録を作成
    entry_log = DbEntryLog(
        id=str(uuid4()),
        user_id=current_user.id,
        action=EntryAction.entry,
        occurred_at=datetime.utcnow()
    )
    db.add(entry_log)
    
    # 犬の情報をバルククエリで一括取得
    dogs_info = []
    if request.dog_ids:
        owned_dogs = db.query(DbDog).filter(
            DbDog.id.in_(request.dog_ids),
            DbDog.owner_id == current_user.id
        ).all()
        dogs_info = [{"id": dog.id, "name": dog.name} for dog in owned_dogs]
    
    db.commit()
    
    return EntryResponse(
        entry_id=entry_log.id,
        user_id=current_user.id,
        user_name=f"{current_user.last_name or ''} {current_user.first_name or ''}".strip(),
        dogs=dogs_info,
        entry_time=entry_log.occurred_at,
        status="in_park"
    )


@router.post("/exit")
async def exit_dogrun(
    current_user = Depends(get_current_user),
    db=Depends(get_db)
):
    """ドッグラン退場記録"""
    # 最後の入場記録を確認
    last_entry = db.query(DbEntryLog).filter(
        DbEntryLog.user_id == current_user.id
    ).order_by(DbEntryLog.occurred_at.desc()).first()
    
    if not last_entry or last_entry.action != EntryAction.entry:
        raise HTTPException(status_code=400, detail="入場記録がありません")
    
    # 退場記録を作成
    exit_log = DbEntryLog(
        id=str(uuid4()),
        user_id=current_user.id,
        action=EntryAction.exit,
        occurred_at=datetime.utcnow()
    )
    db.add(exit_log)
    db.commit()
    
    # 滞在時間を計算
    duration = exit_log.occurred_at - last_entry.occurred_at
    minutes = int(duration.total_seconds() / 60)
    
    return {
        "message": "退場処理が完了しました",
        "entry_time": last_entry.occurred_at,
        "exit_time": exit_log.occurred_at,
        "duration_minutes": minutes
    }


@router.get("/current", response_model=CurrentVisitorsResponse)
async def get_current_visitors(
    db=Depends(get_db)
):
    """現在の在場者一覧取得"""
    # サブクエリ：各ユーザーの最新の記録時刻を取得
    latest_logs = db.query(
        DbEntryLog.user_id,
        func.max(DbEntryLog.occurred_at).label('latest_time')
    ).group_by(DbEntryLog.user_id).subquery()
    
    # 最新の記録がentryであるユーザーを取得
    current_visitors = db.query(DbEntryLog).join(
        latest_logs,
        and_(
            DbEntryLog.user_id == latest_logs.c.user_id,
            DbEntryLog.occurred_at == latest_logs.c.latest_time
        )
    ).filter(DbEntryLog.action == EntryAction.entry).all()
    
    if not current_visitors:
        return CurrentVisitorsResponse(
            total_visitors=0,
            total_dogs=0,
            visitors=[]
        )
    
    user_ids = list(set(log.user_id for log in current_visitors))
    
    # ユーザー情報を一括取得
    users = {u.id: u for u in db.query(DbUser).filter(DbUser.id.in_(user_ids)).all()}
    
    # 犬情報を一括取得（各ユーザーの犬）
    all_dogs = db.query(DbDog).filter(DbDog.owner_id.in_(user_ids)).all()
    dogs_by_user = {}
    for dog in all_dogs:
        if dog.owner_id not in dogs_by_user:
            dogs_by_user[dog.owner_id] = []
        dogs_by_user[dog.owner_id].append(dog)
    
    visitors = []
    total_dogs = 0
    
    for log in current_visitors:
        user = users.get(log.user_id)
        if user:
            dogs = dogs_by_user.get(user.id, [])
            dogs_info = [{"id": dog.id, "name": dog.name} for dog in dogs]
            total_dogs += len(dogs)
            
            visitors.append(EntryResponse(
                entry_id=log.id,
                user_id=user.id,
                user_name=f"{user.last_name or ''} {user.first_name or ''}".strip(),
                dogs=dogs_info,
                entry_time=log.occurred_at,
                status="in_park"
            ))
    
    return CurrentVisitorsResponse(
        total_visitors=len(visitors),
        total_dogs=total_dogs,
        visitors=visitors
    )


@router.get("/history", response_model=List[EntryHistoryResponse])
async def get_entry_history(
    limit: int = 50,
    current_user = Depends(get_current_user),
    db=Depends(get_db)
):
    """入退場履歴取得（自分の履歴）"""
    logs = db.query(DbEntryLog).filter(
        DbEntryLog.user_id == current_user.id
    ).order_by(DbEntryLog.occurred_at.desc()).limit(limit).all()
    
    if not logs:
        return []
    
    # 同じユーザーの犬情報は一度だけ取得（キャッシュ）
    dogs = db.query(DbDog).filter(DbDog.owner_id == current_user.id).all()
    dog_names = [dog.name for dog in dogs]
    
    history = []
    for log in logs:
        history.append(EntryHistoryResponse(
            id=log.id,
            user_id=log.user_id,
            user_name=f"{current_user.last_name or ''} {current_user.first_name or ''}".strip(),
            action=log.action.value,
            occurred_at=log.occurred_at,
            dogs=dog_names
        ))
    
    return history

