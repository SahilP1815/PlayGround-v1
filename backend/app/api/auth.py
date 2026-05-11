from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, Token
from app.core.security import create_access_token, verify_password, get_password_hash
from typing import Any
from app.db.mock_db import MockDB
import uuid

router = APIRouter()

@router.post("/signup", response_model=UserResponse)
async def signup(user_in: UserCreate) -> Any:
    # 1. Try MongoDB if available
    try:
        user = await User.find_one(User.email == user_in.email)
        if user:
            raise HTTPException(status_code=400, detail="A user with this email already exists.")
    except Exception:
        pass

    # 2. Check MockDB
    mock_user = MockDB.get_user_by_email(user_in.email)
    if mock_user:
        raise HTTPException(status_code=400, detail="A user with this email already exists.")
    
    hashed_password = get_password_hash(user_in.password)
    user_id = str(uuid.uuid4())
    
    # 3. Create user in MongoDB
    new_user = User(
        name=user_in.name,
        email=user_in.email,
        phone=user_in.phone,
        hashed_password=hashed_password,
        role=user_in.role
    )
    try:
        await new_user.insert()
        user_id = str(new_user.id)
    except Exception:
        print("Warning: Failed to save user to MongoDB. Saving to MockDB only.")

    # 4. Save to MockDB
    mock_user_dict = {
        "id": user_id,
        "name": user_in.name,
        "email": user_in.email,
        "phone": user_in.phone,
        "role": user_in.role,
        "hashed_password": hashed_password
    }
    MockDB.add_user(mock_user_dict)
    
    return UserResponse(**mock_user_dict)

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()) -> Any:
    user = None
    # 1. Try MongoDB
    try:
        user = await User.find_one(User.email == form_data.username)
    except Exception:
        pass
    
    # 2. Try MockDB if not in MongoDB
    if not user:
        mock_user = MockDB.get_user_by_email(form_data.username)
        if mock_user:
            # Create a pseudo-user object for verify_password
            from pydantic import BaseModel
            class PseudoUser(BaseModel):
                id: str
                hashed_password: str
            user = PseudoUser(id=mock_user["id"], hashed_password=mock_user["hashed_password"])

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
