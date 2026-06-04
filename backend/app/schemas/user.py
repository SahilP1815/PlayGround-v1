from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from app.models.user import UserRole
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.USER

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: UserRole
    phone: Optional[str] = None
    bio: Optional[str] = None
    avatar_color: Optional[str] = None
    favorites: list[str] = []
    is_handler: bool = False
    handler_for_owner_id: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

    @field_validator("id", mode="before")
    @classmethod
    def convert_objectid_to_str(cls, v):
        return str(v)

class ProfileUpdate(BaseModel):
    name: str
    phone: Optional[str] = None
    bio: Optional[str] = None
    avatar_color: Optional[str] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None
