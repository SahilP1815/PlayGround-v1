from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordRequestForm
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, Token
from app.core.security import create_access_token, verify_password, get_password_hash
from app.api.deps import get_current_user
from typing import Any

router = APIRouter()

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
        role=user_in.role
    )
    await new_user.insert()
    
    # Return with id converted to string
    return UserResponse(
        id=str(new_user.id),
        name=new_user.name,
        email=str(new_user.email),
        role=new_user.role
    )

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    role: str = Form(None)
) -> Any:
    # Find user in MongoDB
    user = await User.find_one(User.email == form_data.username)
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user role matches the intended login role (if provided)
    if role and user.role != role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"You are registered as a {user.role}. Please log in using the correct portal."
        )
    
    return {
        "access_token": create_access_token(str(user.id)),
        "token_type": "bearer",
    }

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)) -> Any:
    return UserResponse(
        id=str(current_user.id),
        name=current_user.name,
        email=str(current_user.email),
        role=current_user.role
    )
