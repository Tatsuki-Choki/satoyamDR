"""
共通スキーマ（ユーザー側と管理側で共有）
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

# ==== 共通Enum ====
class ApplicationStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

class PostStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    reported = "reported"

class NoticeStatus(str, Enum):
    draft = "draft"
    published = "published"
    archived = "archived"

class NoticePriority(str, Enum):
    low = "low"
    normal = "normal"
    high = "high"
    urgent = "urgent"

# ==== 共通認証スキーマ ====
class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class MessageResponse(BaseModel):
    message: str

# ==== 共通リクエストスキーマ ====
class CalendarRequest(BaseModel):
    year: int
    month: int

# ==== 共通タグスキーマ ====
class TagResponse(BaseModel):
    id: str
    label: str
    
    class Config:
        from_attributes = True

