from beanie import Document, Indexed
from pydantic import EmailStr
from typing import Optional
from enum import Enum

class UserRole(str, Enum):
    USER = "user"
    OWNER = "owner"
    ADMIN = "admin"

class User(Document):
    name: str
    email: Indexed(EmailStr, unique=True)
    phone: str
    hashed_password: str
    role: UserRole = UserRole.USER

    class Settings:
        name = "users"
