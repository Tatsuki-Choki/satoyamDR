"""
イベント関連のルーター
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime, date
from uuid import uuid4
from sqlalchemy import func

from routers.shared import get_db, get_current_user
from db_control.models import (
    Event as DbEvent, EventRegistration as DbEventRegistration,
    Dog as DbDog, User as DbUser
)
from schemas import (
    EventResponse as EventDbResponse, EventDetailResponse,
    EventRegistrationRequest, EventParticipantResponse
)

router = APIRouter(tags=["イベント"])


@router.get("/api/events/upcoming")
async def get_upcoming_events_public(db=Depends(get_db)):
    """今後のイベント一覧取得（パブリックAPI）"""
    events = db.query(DbEvent).filter(
        DbEvent.event_date >= date.today()
    ).order_by(DbEvent.event_date, DbEvent.start_time).all()
    
    if not events:
        return []
    
    event_ids = [event.id for event in events]
    
    # 参加者数を一括取得
    participants_counts = {
        event_id: count
        for event_id, count in db.query(
            DbEventRegistration.event_id,
            func.count(DbEventRegistration.id)
        ).filter(DbEventRegistration.event_id.in_(event_ids)).group_by(DbEventRegistration.event_id).all()
    }
    
    result = []
    for event in events:
        result.append({
            "id": event.id,
            "title": event.title,
            "description": event.description,
            "event_date": event.event_date.isoformat() if event.event_date else None,
            "start_time": event.start_time.strftime("%H:%M") if event.start_time else "",
            "end_time": event.end_time.strftime("%H:%M") if event.end_time else "",
            "location": event.location,
            "capacity": event.capacity or 0,
            "fee": event.fee or 0,
            "status": event.status.value if hasattr(event.status, 'value') else "reception",
            "current_participants": participants_counts.get(event.id, 0)
        })
    
    return result


@router.get("/events", response_model=List[EventDbResponse])
async def get_events(
    upcoming_only: bool = True,
    current_user = Depends(get_current_user),
    db=Depends(get_db)
):
    """イベント一覧取得（参加状況付き）"""
    query = db.query(DbEvent)
    
    if upcoming_only:
        # 今日以降のイベントのみ
        query = query.filter(DbEvent.event_date >= date.today())
    
    events = query.order_by(DbEvent.event_date, DbEvent.start_time).all()
    
    if not events:
        return []
    
    event_ids = [event.id for event in events]
    
    # 参加者数を一括取得
    participants_counts = {
        event_id: count
        for event_id, count in db.query(
            DbEventRegistration.event_id,
            func.count(DbEventRegistration.id)
        ).filter(DbEventRegistration.event_id.in_(event_ids)).group_by(DbEventRegistration.event_id).all()
    }
    
    # 現在のユーザーが登録しているイベントを一括取得
    registered_event_ids = set(
        event_id for event_id, in db.query(DbEventRegistration.event_id).filter(
            DbEventRegistration.event_id.in_(event_ids),
            DbEventRegistration.user_id == current_user.id
        ).all()
    )
    
    responses = []
    for event in events:
        responses.append(EventDbResponse(
            id=event.id,
            title=event.title,
            description=event.description,
            event_date=event.event_date,
            start_time=event.start_time.strftime("%H:%M") if event.start_time else "",
            end_time=event.end_time.strftime("%H:%M") if event.end_time else "",
            location=event.location,
            capacity=event.capacity or 0,
            fee=event.fee or 0,
            status=event.status.value if event.status else "reception",
            current_participants=participants_counts.get(event.id, 0),
            is_registered=event.id in registered_event_ids,
            created_at=event.created_at,
            updated_at=event.updated_at
        ))
    
    return responses


@router.get("/events/{event_id}", response_model=EventDetailResponse)
async def get_event_detail(
    event_id: str,
    current_user = Depends(get_current_user),
    db=Depends(get_db)
):
    """イベント詳細取得"""
    event = db.query(DbEvent).filter(DbEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="イベントが見つかりません")
    
    # 参加者数を取得
    participants_count = db.query(DbEventRegistration).filter(
        DbEventRegistration.event_id == event.id
    ).count()
    
    # 現在のユーザーの登録状況を確認
    user_registrations = db.query(DbEventRegistration).filter(
        DbEventRegistration.event_id == event.id,
        DbEventRegistration.user_id == current_user.id
    ).all()
    
    is_registered = len(user_registrations) > 0
    my_dogs_registered = [reg.dog_id for reg in user_registrations if reg.dog_id]
    
    return EventDetailResponse(
        id=event.id,
        title=event.title,
        description=event.description,
        event_date=event.event_date,
        start_time=event.start_time.strftime("%H:%M") if event.start_time else "",
        end_time=event.end_time.strftime("%H:%M") if event.end_time else "",
        location=event.location,
        capacity=event.capacity or 0,
        fee=event.fee or 0,
        status=event.status.value if event.status else "reception",
        current_participants=participants_count,
        is_registered=is_registered,
        my_dogs_registered=my_dogs_registered,
        created_at=event.created_at,
        updated_at=event.updated_at
    )


@router.post("/events/{event_id}/register")
async def register_for_event(
    event_id: str,
    request: EventRegistrationRequest,
    current_user = Depends(get_current_user),
    db=Depends(get_db)
):
    """イベント参加登録"""
    # イベントの存在確認
    event = db.query(DbEvent).filter(DbEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="イベントが見つかりません")
    
    # 定員確認
    current_participants = db.query(DbEventRegistration).filter(
        DbEventRegistration.event_id == event_id
    ).count()
    
    if event.capacity and current_participants >= event.capacity:
        raise HTTPException(status_code=400, detail="イベントは満員です")
    
    # 既存の登録を削除（再登録の場合）
    db.query(DbEventRegistration).filter(
        DbEventRegistration.event_id == event_id,
        DbEventRegistration.user_id == current_user.id
    ).delete()
    
    # 新規登録
    if request.dog_ids:
        # 犬の所有権確認をバルククエリで一括取得
        owned_dogs = {
            dog.id: dog
            for dog in db.query(DbDog).filter(
                DbDog.id.in_(request.dog_ids),
                DbDog.owner_id == current_user.id
            ).all()
        }
        
        for dog_id in request.dog_ids:
            if dog_id in owned_dogs:
                registration = DbEventRegistration(
                    id=str(uuid4()),
                    user_id=current_user.id,
                    event_id=event_id,
                    dog_id=dog_id
                )
                db.add(registration)
    else:
        # ユーザーのみの登録（犬なし）
        registration = DbEventRegistration(
            id=str(uuid4()),
            user_id=current_user.id,
            event_id=event_id,
            dog_id=None
        )
        db.add(registration)
    
    db.commit()
    
    return {"message": "イベントに参加登録しました", "event_id": event_id}


@router.delete("/events/{event_id}/register")
async def cancel_event_registration(
    event_id: str,
    current_user = Depends(get_current_user),
    db=Depends(get_db)
):
    """イベント参加キャンセル"""
    # 登録の存在確認
    registrations = db.query(DbEventRegistration).filter(
        DbEventRegistration.event_id == event_id,
        DbEventRegistration.user_id == current_user.id
    ).all()
    
    if not registrations:
        raise HTTPException(status_code=404, detail="参加登録が見つかりません")
    
    # 登録を削除
    for reg in registrations:
        db.delete(reg)
    
    db.commit()
    
    return {"message": "参加をキャンセルしました", "event_id": event_id}


@router.get("/events/{event_id}/participants", response_model=List[EventParticipantResponse])
async def get_event_participants(
    event_id: str,
    db=Depends(get_db)
):
    """イベント参加者一覧取得"""
    # イベントの存在確認
    event = db.query(DbEvent).filter(DbEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="イベントが見つかりません")
    
    # 参加登録を取得
    registrations = db.query(DbEventRegistration).filter(
        DbEventRegistration.event_id == event_id
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
        user_name = f"{user.last_name or ''} {user.first_name or ''}".strip() if user else "不明"
        
        dog_name = None
        if reg.dog_id:
            dog = dogs.get(reg.dog_id)
            dog_name = dog.name if dog else None
        
        responses.append(EventParticipantResponse(
            id=reg.id,
            user_id=reg.user_id,
            user_name=user_name,
            dog_id=reg.dog_id,
            dog_name=dog_name,
            registered_at=datetime.utcnow()  # EventRegistrationにregistered_atがない場合の仮値
        ))
    
    return responses


@router.get("/calendar/{year}/{month}")
async def get_calendar(year: int, month: int):
    """カレンダー情報取得"""
    # 実際の実装ではデータベースから取得
    return {
        "year": year,
        "month": month,
        "days": []  # カレンダーの日付情報
    }

