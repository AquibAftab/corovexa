from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from jwt.exceptions import InvalidTokenError
from app.config import settings
from app.database.mongodb import db_client

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except InvalidTokenError:
        raise credentials_exception
        
    if not db_client.is_connected:
        raise HTTPException(status_code=500, detail="Database not connected")
        
    user = await db_client.db.users.find_one({"email": email})
    if user is None:
        raise credentials_exception
        
    return user

async def get_current_active_user(current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_active", True):
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def role_required(required_roles: list[str]):
    def role_checker(current_user: dict = Depends(get_current_active_user)):
        if current_user.get("role") not in required_roles and "Admin" not in required_roles:
            raise HTTPException(status_code=403, detail="Not enough privileges")
        return current_user
    return role_checker
