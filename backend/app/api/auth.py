from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, Token
from app.core.security import create_access_token, verify_password, get_password_hash
from typing import Any

router = APIRouter()

@router.post("/signup", response_model=UserResponse)
async def signup(user_in: UserCreate) -> Any:
    user = await User.find_one(User.email == user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="A user with this email already exists.",
        )
    
    new_user = User(
        name=user_in.name,
        email=user_in.email,
        phone=user_in.phone,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role
    )
    await new_user.insert()
    return UserResponse(
        id=str(new_user.id),
        name=new_user.name,
        email=new_user.email,
        phone=new_user.phone,
        role=new_user.role
    )

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()) -> Any:
    user = await User.find_one(User.email == form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return {
        "access_token": create_access_token(user.id),
        "token_type": "bearer",
    }
