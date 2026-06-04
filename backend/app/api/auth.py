from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordRequestForm
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, Token, ProfileUpdate, PasswordChange
from app.core.security import create_access_token, verify_password, get_password_hash
from app.api.deps import get_current_user
from typing import Any
import random

router = APIRouter()

AVATAR_COLORS = ["#1abc9c", "#3498db", "#9b59b6", "#e67e22", "#e74c3c", "#2ecc71", "#f1c40f", "#34495e"]

@router.post("/signup", response_model=UserResponse)
async def signup(user_in: UserCreate) -> Any:
    # Check if user already exists
    user = await User.find_one(User.email == user_in.email)
    if user:
        raise HTTPException(status_code=400, detail="A user with this email already exists.")

    hashed_password = get_password_hash(user_in.password)
    
    # Create user in MongoDB
    new_user = User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=hashed_password,
        role=user_in.role,
        avatar_color=random.choice(AVATAR_COLORS)
    )
    await new_user.insert()
    
    return new_user

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    role: str = Form(None)
) -> Any:
    # Find user in MongoDB
    user = await User.find_one(User.email == form_data.username)
    
    role_allowed = True
    if user and role:
        if user.role == role:
            role_allowed = True
        elif user.role == "handler" and role == "owner":
            role_allowed = True
        elif user.role == "admin":
            role_allowed = True
        else:
            role_allowed = False

    if user and user.role == "handler":
        from app.models.handler import Handler
        handler_doc = await Handler.find_one(Handler.user_id == str(user.id))
        if handler_doc and not handler_doc.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your handler access has been revoked.",
                headers={"WWW-Authenticate": "Bearer"},
            )

    if not user or not verify_password(form_data.password, user.hashed_password) or not role_allowed:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="invalid email address or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return {
        "access_token": create_access_token(str(user.id)),
        "token_type": "bearer",
    }

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)) -> Any:
    return current_user

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    profile_in: ProfileUpdate,
    current_user: User = Depends(get_current_user)
) -> Any:
    current_user.name = profile_in.name
    current_user.phone = profile_in.phone
    current_user.bio = profile_in.bio
    if profile_in.avatar_color:
        current_user.avatar_color = profile_in.avatar_color
    
    await current_user.save()
    return current_user

@router.put("/change-password")
async def change_password(
    pwd_in: PasswordChange,
    current_user: User = Depends(get_current_user)
) -> Any:
    if not verify_password(pwd_in.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    current_user.hashed_password = get_password_hash(pwd_in.new_password)
    await current_user.save()
    
    return {"message": "Password changed successfully"}

@router.post("/favorites/{ground_id}", response_model=UserResponse)
async def toggle_favorite(
    ground_id: str,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Toggle a ground in the user's favorites list.
    Adds the ground_id if not present, removes it if already present.
    """
    if not current_user.favorites:
        current_user.favorites = []
        
    if ground_id in current_user.favorites:
        current_user.favorites.remove(ground_id)
    else:
        current_user.favorites.append(ground_id)
        
    await current_user.save()
    return current_user

