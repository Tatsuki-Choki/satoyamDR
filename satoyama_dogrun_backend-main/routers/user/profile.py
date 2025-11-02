"""
ユーザープロフィールと犬のプロフィール関連のルーター
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime, date
from uuid import uuid4

from routers.shared import get_db, get_current_user
from exceptions import SatoyamaDogrunException
from db_control.models import Dog as DbDog, VaccinationRecord as DbVaccinationRecord
from schemas import (
    UserDbResponse, UserProfileDetailResponse, UpdateUserDbRequest,
    DogDbResponse, CreateDogDbRequest, UpdateDogDbRequest,
    VaccinationRecordResponse, VaccinationRecordRequest
)

router = APIRouter(tags=["ユーザープロフィール"])


@router.get("/users/me", response_model=UserDbResponse)
async def get_current_user_info(current_user = Depends(get_current_user)):
    """現在のユーザー情報取得"""
    return UserDbResponse(
        id=current_user.id,
        email=current_user.email,
        last_name=current_user.last_name,
        first_name=current_user.first_name,
        address=current_user.address,
        phone_number=current_user.phone_number,
        prefecture=current_user.prefecture,
        city=current_user.city,
        created_at=current_user.created_at or datetime.utcnow(),
    )


@router.get("/users/profile", response_model=UserProfileDetailResponse)
async def get_user_profile_detail(
    current_user = Depends(get_current_user),
    db=Depends(get_db)
):
    """ユーザープロフィール詳細取得（犬情報を含む）"""
    # ユーザーの犬情報を取得
    dogs = db.query(DbDog).filter(DbDog.owner_id == current_user.id).all()
    
    return UserProfileDetailResponse(
        id=current_user.id,
        email=current_user.email,
        last_name=current_user.last_name,
        first_name=current_user.first_name,
        address=current_user.address,
        phone_number=current_user.phone_number,
        prefecture=current_user.prefecture,
        city=current_user.city,
        created_at=current_user.created_at or datetime.utcnow(),
        dogs=[
            DogDbResponse(
                id=dog.id,
                owner_id=dog.owner_id,
                name=dog.name,
                breed=dog.breed,
                birthday_at=dog.birthday_at or date.today(),
                gender=dog.gender,
                personality=dog.personality,
                likes=dog.likes,
                avatar_url=dog.avatar_url,
                created_at=dog.created_at,
                updated_at=dog.updated_at
            ) for dog in dogs
        ]
    )


@router.put("/users/profile", response_model=UserDbResponse)
async def update_user_profile(
    request: UpdateUserDbRequest,
    current_user = Depends(get_current_user),
    db=Depends(get_db)
):
    """ユーザープロフィール更新"""
    if request.last_name is not None:
        current_user.last_name = request.last_name
    if request.first_name is not None:
        current_user.first_name = request.first_name
    if request.address is not None:
        current_user.address = request.address
    if request.phone_number is not None:
        current_user.phone_number = request.phone_number
    if request.prefecture is not None:
        current_user.prefecture = request.prefecture
    if request.city is not None:
        current_user.city = request.city
    
    db.commit()
    db.refresh(current_user)
    return UserDbResponse(
        id=current_user.id,
        email=current_user.email,
        last_name=current_user.last_name,
        first_name=current_user.first_name,
        address=current_user.address,
        phone_number=current_user.phone_number,
        prefecture=current_user.prefecture,
        city=current_user.city,
        created_at=current_user.created_at or datetime.utcnow(),
    )


# 犬のプロフィール関連
@router.get("/dogs", response_model=List[DogDbResponse])
async def get_user_dogs(current_user = Depends(get_current_user), db=Depends(get_db)):
    """ユーザーの犬一覧取得"""
    dogs = db.query(DbDog).filter(DbDog.owner_id == current_user.id).all()
    return [
        DogDbResponse(
            id=d.id, owner_id=d.owner_id, name=d.name, breed=d.breed,
            birthday_at=d.birthday_at, gender=d.gender, personality=d.personality,
            likes=d.likes, avatar_url=d.avatar_url, created_at=d.created_at, updated_at=d.updated_at
        ) for d in dogs
    ]


@router.post("/dogs", response_model=DogDbResponse)
async def add_dog(
    request: CreateDogDbRequest,
    current_user = Depends(get_current_user),
    db=Depends(get_db)
):
    """犬の登録"""
    dog = DbDog(
        id=str(uuid4()),
        owner_id=current_user.id,
        name=request.name,
        breed=request.breed,
        birthday_at=request.birthday_at,
        gender=request.gender,
        personality=request.personality,
        likes=request.likes,
        avatar_url=request.avatar_url,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(dog)
    db.commit()
    db.refresh(dog)
    return DogDbResponse(
        id=dog.id, owner_id=dog.owner_id, name=dog.name, breed=dog.breed,
        birthday_at=dog.birthday_at, gender=dog.gender, personality=dog.personality,
        likes=dog.likes, avatar_url=dog.avatar_url, created_at=dog.created_at, updated_at=dog.updated_at
    )


@router.put("/dogs/{dog_id}", response_model=DogDbResponse)
async def update_dog(
    dog_id: str,
    request: UpdateDogDbRequest,
    current_user = Depends(get_current_user),
    db=Depends(get_db)
):
    """犬の情報更新"""
    dog = db.query(DbDog).filter(DbDog.id == dog_id, DbDog.owner_id == current_user.id).first()
    if not dog:
        raise HTTPException(status_code=404, detail="犬が見つかりません")
    
    if request.name is not None:
        dog.name = request.name
    if request.breed is not None:
        dog.breed = request.breed
    if request.birthday_at is not None:
        dog.birthday_at = request.birthday_at
    if request.gender is not None:
        dog.gender = request.gender
    if request.personality is not None:
        dog.personality = request.personality
    if request.likes is not None:
        dog.likes = request.likes
    if request.avatar_url is not None:
        dog.avatar_url = request.avatar_url
    dog.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(dog)
    return DogDbResponse(
        id=dog.id, owner_id=dog.owner_id, name=dog.name, breed=dog.breed,
        birthday_at=dog.birthday_at, gender=dog.gender, personality=dog.personality,
        likes=dog.likes, avatar_url=dog.avatar_url, created_at=dog.created_at, updated_at=dog.updated_at
    )


@router.delete("/dogs/{dog_id}")
async def delete_dog(
    dog_id: str,
    current_user = Depends(get_current_user),
    db=Depends(get_db)
):
    """犬の削除"""
    dog = db.query(DbDog).filter(DbDog.id == dog_id, DbDog.owner_id == current_user.id).first()
    if not dog:
        raise HTTPException(status_code=404, detail="犬が見つかりません")
    
    db.delete(dog)
    db.commit()
    return {"message": "削除しました"}


# ワクチン接種記録関連
@router.get("/dogs/{dog_id}/vaccinations", response_model=List[VaccinationRecordResponse])
async def get_vaccination_records(
    dog_id: str,
    current_user = Depends(get_current_user),
    db=Depends(get_db)
):
    """犬のワクチン接種記録取得"""
    # 犬の所有者確認
    dog = db.query(DbDog).filter(DbDog.id == dog_id, DbDog.owner_id == current_user.id).first()
    if not dog:
        raise HTTPException(status_code=404, detail="犬が見つかりません")
    
    records = db.query(DbVaccinationRecord).filter(DbVaccinationRecord.dog_id == dog_id).all()
    return [
        VaccinationRecordResponse(
            id=r.id,
            dog_id=r.dog_id,
            vaccine_type=r.vaccine_type,
            administered_at=r.administered_at,
            next_due_at=r.next_due_at,
            image_url=r.image_url,
            created_at=r.created_at,
            updated_at=r.updated_at
        ) for r in records
    ]


@router.post("/dogs/{dog_id}/vaccinations", response_model=VaccinationRecordResponse)
async def add_vaccination_record(
    dog_id: str,
    request: VaccinationRecordRequest,
    current_user = Depends(get_current_user),
    db=Depends(get_db)
):
    """ワクチン接種記録の追加"""
    # 犬の所有者確認
    dog = db.query(DbDog).filter(DbDog.id == dog_id, DbDog.owner_id == current_user.id).first()
    if not dog:
        raise HTTPException(status_code=404, detail="犬が見つかりません")
    
    record = DbVaccinationRecord(
        id=str(uuid4()),
        dog_id=dog_id,
        vaccine_type=request.vaccine_type,
        administered_at=request.administered_at,
        next_due_at=request.next_due_at,
        image_url=request.image_url,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(record)
    db.commit()
    db.refresh(record)
    
    return VaccinationRecordResponse(
        id=record.id,
        dog_id=record.dog_id,
        vaccine_type=record.vaccine_type,
        administered_at=record.administered_at,
        next_due_at=record.next_due_at,
        image_url=record.image_url,
        created_at=record.created_at,
        updated_at=record.updated_at
    )


@router.delete("/dogs/{dog_id}/vaccinations/{record_id}")
async def delete_vaccination_record(
    dog_id: str,
    record_id: str,
    current_user = Depends(get_current_user),
    db=Depends(get_db)
):
    """ワクチン接種記録の削除"""
    # 犬の所有者確認
    dog = db.query(DbDog).filter(DbDog.id == dog_id, DbDog.owner_id == current_user.id).first()
    if not dog:
        raise HTTPException(status_code=404, detail="犬が見つかりません")
    
    record = db.query(DbVaccinationRecord).filter(
        DbVaccinationRecord.id == record_id,
        DbVaccinationRecord.dog_id == dog_id
    ).first()
    
    if not record:
        raise HTTPException(status_code=404, detail="接種記録が見つかりません")
    
    db.delete(record)
    db.commit()
    return {"message": "削除しました"}

