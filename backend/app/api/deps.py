from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from app.core.security import SECRET_KEY, ALGORITHM
from app.models.user import User
from app.schemas.user import TokenData
from typing import Any

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=user_id)
    except JWTError:
        raise credentials_exception
    
    user = await User.get(token_data.user_id)
    if user is None:
        raise credentials_exception
    return user

def get_current_active_owner(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ["owner", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user does not have enough privileges"
        )
    return current_user

def get_current_active_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user does not have enough privileges"
        )
    return current_user

async def get_current_handler(current_user: User = Depends(get_current_user)) -> tuple[User, Any]:
    # We use Any for Handler typing because of circular dependency prevention if Handler references User
    from app.models.handler import Handler
    if not current_user.is_handler:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user is not a handler"
        )
    handler = await Handler.find_one(Handler.user_id == str(current_user.id))
    if not handler or not handler.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Handler is not active"
        )
    return current_user, handler

def verify_handler_owns_venue(handler: Any, ground_id: str):
    if ground_id not in handler.assigned_venues:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Handler does not have access to this venue"
        )
