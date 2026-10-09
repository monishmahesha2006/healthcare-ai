from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserOut

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticates user and returns JWT bearer token.
    Generic error response to avoid account enumeration.
    """
    user = db.query(User).filter(User.email == request.email.lower().strip()).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        data={"sub": str(user.id), "role": user.role, "email": user.email},
        expires_delta=access_token_expires
    )
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserOut.from_orm(user)
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """Registers a new patient or doctor account."""
    existing_user = db.query(User).filter(User.email == request.email.lower().strip()).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already registered")

    new_user = User(
        email=request.email.lower().strip(),
        hashed_password=get_password_hash(request.password),
        full_name=request.full_name.strip(),
        role=request.role,
        phone=request.phone,
        date_of_birth=request.date_of_birth,
        blood_group=request.blood_group,
        specialty=request.specialty if request.role == "doctor" else None,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(
        data={"sub": str(new_user.id), "role": new_user.role, "email": new_user.email}
    )
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserOut.from_orm(new_user)
    )


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Returns currently authenticated user profile."""
    return UserOut.from_orm(current_user)


@router.post("/logout")
def logout():
    """Client-side session invalidation endpoint."""
    return {"message": "Successfully logged out"}
