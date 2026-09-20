"""Authentication routes for COROVEXA API.

MongoDB user lookup + bcrypt password verification + JWT generation.
"""

from fastapi import APIRouter, HTTPException, status
from ..models.schemas import LoginRequest, LoginResponse
from ..database.mongodb import db_client
from ..services.security import verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest) -> LoginResponse:
    """
    Authenticate user with email and password using MongoDB and JWT.
    """
    if not db_client.is_connected:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database connection error",
        )
        
    user = await db_client.db.users.find_one({"email": request.email})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
        
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )
        
    if not verify_password(request.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
        
    access_token = create_access_token(
        data={"sub": user["email"], "role": user["role"]}
    )
    
    return LoginResponse(
        user=user["name"],
        role=user["role"],
        token=access_token,
    )
