from beanie import Document, Indexed
from pydantic import EmailStr, Field
from typing import Optional
from enum import Enum
from datetime import datetime

class UserRole(str, Enum):
    USER = "user"
    OWNER = "owner"
    ADMIN = "admin"
    HANDLER = "handler"

class User(Document):
    name: str
    email: Indexed(EmailStr, unique=True)
    hashed_password: str
    role: UserRole = UserRole.USER
    phone: Optional[str] = None
    bio: Optional[str] = None
    avatar_color: Optional[str] = None
    favorites: list[str] = Field(default_factory=list)
    
    # Handler info
    is_handler: bool = False
    handler_for_owner_id: Optional[str] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"
