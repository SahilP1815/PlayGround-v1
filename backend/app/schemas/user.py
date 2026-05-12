from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from app.models.user import UserRole

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

    model_config = {"from_attributes": True}

    @field_validator("id", mode="before")
    @classmethod
    def convert_objectid_to_str(cls, v):
        return str(v)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None
