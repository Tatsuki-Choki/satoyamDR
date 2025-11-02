"""
イベント管理関連のルーター
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime, date, time
from uuid import uuid4
from sqlalchemy import func

from routers.shared import get_db, get_current_admin_user
from auth import log_admin_action
from db_control.models import (
    Event as DbEvent, EventRegistration, User as DbUser, Dog as DbDog
)
from schemas import (
    EventManagementResponse, EventStatsResponse, EventCreateRequest,
    EventUpdateRequest, EventRegistrationResponse
)

router = APIRouter(prefix="/admin/events", tags=["イベント管理"])


@router.get("", response_model=List[EventManagementResponse])
async def get_events_for_admin(
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """イベント一覧取得（管理者用）"""
    events = db.query(DbEvent).order_by(DbEvent.event_date.desc()).all()
    
    if not events:
        return []
    
    event_ids = [event.id for event in events]
    
    # 参加者数を一括取得
    participants_counts = {
        event_id: count
        for event_id, count in db.query(
            EventRegistration.event_id,
            func.count(EventRegistration.id)
        ).filter(EventRegistration.event_id.in_(event_ids)).group_by(EventRegistration.event_id).all()
    }
    
    responses = []
    for event in events:
        responses.append(EventManagementResponse(
            id=event.id,
            title=event.title,
            description=event.description,
            event_date=event.event_date,
            start_time=str(event.start_time) if event.start_time else "",
            end_time=str(event.end_time) if event.end_time else "",
            location=event.location or "",
            capacity=event.capacity or 0,
            current_participants=participants_counts.get(event.id, 0),
            fee=event.fee or 0,
            status=str(event.status) if event.status else "reception",
            created_at=event.created_at,
            updated_at=event.updated_at
        ))
    
    return responses


@router.get("/stats", response_model=EventStatsResponse)
async def get_events_stats(
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """イベント統計取得"""
    total_events = db.query(func.count(DbEvent.id)).scalar()
    
    # 今後のイベント
    today = date.today()
    upcoming_events = db.query(func.count(DbEvent.id)).filter(
        DbEvent.event_date >= today
    ).scalar()
    
    # 過去のイベント
    past_events = db.query(func.count(DbEvent.id)).filter(
        DbEvent.event_date < today
    ).scalar()
    
    # 総参加者数
    total_participants = db.query(func.count(EventRegistration.id)).scalar()
    
    return EventStatsResponse(
        total_events=total_events,
        upcoming_events=upcoming_events,
        past_events=past_events,
        total_participants=total_participants
    )


@router.post("", response_model=EventManagementResponse)
async def create_event(
    request: EventCreateRequest,
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """イベント作成"""
    start_time_obj = None
    end_time_obj = None
    if request.start_time:
        hour, minute = map(int, request.start_time.split(":"))
        start_time_obj = time(hour, minute)
    if request.end_time:
        hour, minute = map(int, request.end_time.split(":"))
        end_time_obj = time(hour, minute)
    
    event = DbEvent(
        id=str(uuid4()),
        title=request.title,
        description=request.description,
        event_date=request.event_date,
        start_time=start_time_obj,
        end_time=end_time_obj,
        location=request.location,
        capacity=request.capacity,
        fee=request.fee,
        status="reception",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(event)
    db.commit()
    db.refresh(event)
    
    # 管理者ログを記録
    await log_admin_action(
        admin_user_id=current_admin.id,
        action="event_created",
        target_type="event",
        target_id=event.id,
        details=f"イベントを作成: {request.title}",
        db=db
    )
    
    return EventManagementResponse(
        id=event.id,
        title=event.title,
        description=event.description,
        event_date=event.event_date,
        start_time=str(event.start_time) if event.start_time else "",
        end_time=str(event.end_time) if event.end_time else "",
        location=event.location or "",
        capacity=event.capacity or 0,
        current_participants=0,
        fee=event.fee or 0,
        status=str(event.status),
        created_at=event.created_at,
        updated_at=event.updated_at
    )


@router.get("/{event_id}", response_model=EventManagementResponse)
async def get_event_detail(
    event_id: str,
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """イベント詳細取得"""
    event = db.query(DbEvent).filter(DbEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="イベントが見つかりません")
    
    participants_count = db.query(EventRegistration).filter(
        EventRegistration.event_id == event_id
    ).count()
    
    return EventManagementResponse(
        id=event.id,
        title=event.title,
        description=event.description,
        event_date=event.event_date,
        start_time=str(event.start_time) if event.start_time else "",
        end_time=str(event.end_time) if event.end_time else "",
        location=event.location or "",
        capacity=event.capacity or 0,
        current_participants=participants_count,
        fee=event.fee or 0,
        status=str(event.status) if event.status else "reception",
        created_at=event.created_at,
        updated_at=event.updated_at
    )


@router.put("/{event_id}", response_model=EventManagementResponse)
async def update_event(
    event_id: str,
    request: EventUpdateRequest,
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """イベント更新"""
    event = db.query(DbEvent).filter(DbEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="イベントが見つかりません")
    
    if request.title is not None:
        event.title = request.title
    if request.description is not None:
        event.description = request.description
    if request.event_date is not None:
        event.event_date = request.event_date
    if request.start_time is not None:
        hour, minute = map(int, request.start_time.split(":"))
        event.start_time = time(hour, minute)
    if request.end_time is not None:
        hour, minute = map(int, request.end_time.split(":"))
        event.end_time = time(hour, minute)
    if request.location is not None:
        event.location = request.location
    if request.capacity is not None:
        event.capacity = request.capacity
    if request.fee is not None:
        event.fee = request.fee
    if request.status is not None:
        event.status = request.status
    
    event.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(event)
    
    # 管理者ログを記録
    await log_admin_action(
        admin_user_id=current_admin.id,
        action="event_updated",
        target_type="event",
        target_id=event_id,
        details=f"イベントを更新: {event.title}",
        db=db
    )
    
    participants_count = db.query(EventRegistration).filter(
        EventRegistration.event_id == event_id
    ).count()
    
    return EventManagementResponse(
        id=event.id,
        title=event.title,
        description=event.description,
        event_date=event.event_date,
        start_time=str(event.start_time) if event.start_time else "",
        end_time=str(event.end_time) if event.end_time else "",
        location=event.location or "",
        capacity=event.capacity or 0,
        current_participants=participants_count,
        fee=event.fee or 0,
        status=str(event.status) if event.status else "reception",
        created_at=event.created_at,
        updated_at=event.updated_at
    )


@router.delete("/{event_id}")
async def delete_event(
    event_id: str,
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """イベント削除"""
    event = db.query(DbEvent).filter(DbEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="イベントが見つかりません")
    
    # 参加登録も削除
    db.query(EventRegistration).filter(EventRegistration.event_id == event_id).delete()
    
    event_title = event.title
    db.delete(event)
    db.commit()
    
    # 管理者ログを記録
    await log_admin_action(
        admin_user_id=current_admin.id,
        action="event_deleted",
        target_type="event",
        target_id=event_id,
        details=f"イベントを削除: {event_title}",
        db=db
    )
    
    return {"message": "イベントを削除しました"}


@router.get("/{event_id}/registrations", response_model=List[EventRegistrationResponse])
async def get_event_registrations(
    event_id: str,
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """イベント参加者一覧取得"""
    registrations = db.query(EventRegistration).filter(
        EventRegistration.event_id == event_id
    ).all()
    
    if not registrations:
        return []
    
    user_ids = list(set(reg.user_id for reg in registrations))
    dog_ids = list(set(reg.dog_id for reg in registrations if reg.dog_id))
    
    # ユーザー情報を一括取得
    users = {u.id: u for u in db.query(DbUser).filter(DbUser.id.in_(user_ids)).all()}
    
    # 犬情報を一括取得
    dogs = {d.id: d for d in db.query(DbDog).filter(DbDog.id.in_(dog_ids)).all()}
    
    responses = []
    for reg in registrations:
        user = users.get(reg.user_id)
        user_name = f"{user.last_name} {user.first_name}" if user else "不明"
        
        dog_name = None
        if reg.dog_id:
            dog = dogs.get(reg.dog_id)
            dog_name = dog.name if dog else None
        
        responses.append(EventRegistrationResponse(
            id=reg.id,
            user_id=reg.user_id,
            user_name=user_name,
            event_id=reg.event_id,
            dog_id=reg.dog_id,
            dog_name=dog_name,
            registered_at=datetime.utcnow()  # TODO: registered_atフィールド追加後に実装
        ))
    
    return responses


@router.put("/{event_id}/cancel")
async def cancel_event(
    event_id: str,
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """イベントキャンセル"""
    event = db.query(DbEvent).filter(DbEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="イベントが見つかりません")
    
    event.status = "closed"
    event.updated_at = datetime.utcnow()
    db.commit()
    
    # 管理者ログを記録
    await log_admin_action(
        admin_user_id=current_admin.id,
        action="event_cancelled",
        target_type="event",
        target_id=event_id,
        details=f"イベントをキャンセル: {event.title}",
        db=db
    )
    
    return {"message": "イベントをキャンセルしました"}


@router.post("/{event_id}/notify")
async def notify_event_participants(
    event_id: str,
    message: str,
    current_admin = Depends(get_current_admin_user),
    db=Depends(get_db)
):
    """イベント参加者への通知"""
    event = db.query(DbEvent).filter(DbEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="イベントが見つかりません")
    
    registrations = db.query(EventRegistration).filter(
        EventRegistration.event_id == event_id
    ).all()
    
    # TODO: 実際の通知送信処理を実装
    # ここではログ記録のみ
    
    # 管理者ログを記録
    await log_admin_action(
        admin_user_id=current_admin.id,
        action="event_notification_sent",
        target_type="event",
        target_id=event_id,
        details=f"参加者{len(registrations)}名に通知: {message[:50]}",
        db=db
    )
    
    return {"message": f"{len(registrations)}名の参加者に通知を送信しました"}

