"""
ユーザー側スキーマ
"""
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime, date

# ==== ユーザー認証・登録 ====
class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    address: str
    phone_number: str
    imabari_residency: str

class RegisterDbRequest(BaseModel):
    email: str
    password: str
    last_name: str
    first_name: Optional[str] = None
    address: Optional[str] = None
    phone_number: Optional[str] = None
    prefecture: Optional[str] = None
    city: Optional[str] = None

class UserRegisterResponse(BaseModel):
    id: str
    email: str
    full_name: str
    address: str
    phone_number: str
    imabari_residency: str
    created_at: datetime

class ApplicationStatusResponse(BaseModel):
    application_id: str
    status: str
    rejection_reason: Optional[str] = None
    approved_at: Optional[datetime] = None
    created_at: datetime

# ==== ユーザープロフィール ====
class UpdateUserProfileRequest(BaseModel):
    full_name: str
    address: str
    phone_number: str
    imabari_residency: str

class UpdateUserDbRequest(BaseModel):
    last_name: Optional[str] = None
    first_name: Optional[str] = None
    address: Optional[str] = None
    phone_number: Optional[str] = None
    prefecture: Optional[str] = None
    city: Optional[str] = None

class UserDbResponse(BaseModel):
    id: str
    email: str
    last_name: Optional[str] = None
    first_name: Optional[str] = None
    address: Optional[str] = None
    phone_number: Optional[str] = None
    prefecture: Optional[str] = None
    city: Optional[str] = None
    created_at: Optional[datetime] = None

class UserProfileDetailResponse(BaseModel):
    id: str
    email: str
    last_name: Optional[str] = None
    first_name: Optional[str] = None
    address: Optional[str] = None
    phone_number: Optional[str] = None
    prefecture: Optional[str] = None
    city: Optional[str] = None
    created_at: Optional[datetime] = None
    dogs: List['DogDbResponse'] = []

    class Config:
        from_attributes = True

# ==== 犬のプロフィール ====
class AddDogRequest(BaseModel):
    name: str
    breed: str
    weight: str
    personality: List[str]
    last_vaccination_date: str

class CreateDogDbRequest(BaseModel):
    name: str
    breed: Optional[str] = None
    birthday_at: date
    gender: Optional[str] = None
    personality: Optional[str] = None
    likes: Optional[str] = None
    avatar_url: Optional[str] = None

class UpdateDogDbRequest(BaseModel):
    name: Optional[str] = None
    breed: Optional[str] = None
    birthday_at: Optional[date] = None
    gender: Optional[str] = None
    personality: Optional[str] = None
    likes: Optional[str] = None
    avatar_url: Optional[str] = None

class DogDbResponse(BaseModel):
    id: str
    owner_id: str
    name: str
    breed: Optional[str] = None
    birthday_at: date
    gender: Optional[str] = None
    personality: Optional[str] = None
    likes: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class VaccinationRecordRequest(BaseModel):
    vaccine_type: str
    administered_at: date
    next_due_at: Optional[date] = None
    image_url: Optional[str] = None

class VaccinationRecordResponse(BaseModel):
    id: str
    dog_id: str
    vaccine_type: str
    administered_at: date
    next_due_at: Optional[date] = None
    image_url: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ==== 投稿関連 ====
class CreatePostRequest(BaseModel):
    content: str
    category: str
    hashtags: Optional[str] = None

class CreatePostDbRequest(BaseModel):
    content: str
    images: Optional[List[str]] = None
    hashtags: Optional[List[str]] = None

class PostDbResponse(BaseModel):
    id: str
    user_id: str
    content: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    comments_count: int
    likes_count: int

class PostDetailResponse(BaseModel):
    id: str
    user_id: str
    user_name: str
    user_avatar: Optional[str] = None
    content: str
    images: List[str] = []
    hashtags: List[str] = []
    created_at: datetime
    updated_at: Optional[datetime] = None
    comments_count: int
    likes_count: int
    is_liked: bool = False
    
    class Config:
        from_attributes = True

class AddCommentRequest(BaseModel):
    text: str

class CreateCommentDbRequest(BaseModel):
    content: str

class CommentDbResponse(BaseModel):
    id: str
    post_id: str
    user_id: str
    user_name: Optional[str] = None
    content: str
    created_at: datetime

# ==== イベント関連 ====
class EventResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    event_date: date
    start_time: str
    end_time: str
    location: str
    capacity: int
    fee: int
    status: str
    current_participants: int = 0
    is_registered: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class EventDetailResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    event_date: date
    start_time: str
    end_time: str
    location: str
    capacity: int
    fee: int
    status: str
    current_participants: int = 0
    is_registered: bool = False
    my_dogs_registered: List[str] = []
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class EventRegistrationRequest(BaseModel):
    dog_ids: List[str]

class EventParticipantResponse(BaseModel):
    id: str
    user_id: str
    user_name: str
    dog_id: Optional[str] = None
    dog_name: Optional[str] = None
    registered_at: datetime
    
    class Config:
        from_attributes = True

# ==== 入場管理 ====
class QRCodeResponse(BaseModel):
    qr_code: str
    user_id: str
    expires_at: datetime

class EntryRequest(BaseModel):
    dog_ids: List[str] = []

class EntryResponse(BaseModel):
    entry_id: str
    user_id: str
    user_name: str
    dogs: List[Dict[str, str]] = []
    entry_time: datetime
    status: str = "in_park"
    
    class Config:
        from_attributes = True

class CurrentVisitorsResponse(BaseModel):
    total_visitors: int
    total_dogs: int
    visitors: List[EntryResponse] = []

class EntryHistoryResponse(BaseModel):
    id: str
    user_id: str
    user_name: str
    action: str
    occurred_at: datetime
    dogs: List[str] = []
    
    class Config:
        from_attributes = True

# Forward reference解決
UserProfileDetailResponse.model_rebuild()

