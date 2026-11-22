from datetime import timedelta
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    create_access_token,
    get_token_subject,
    hash_password,
    verify_password,
)
from app.db.database import get_db
from app.models import User
from app.schemas import LoginRequest, RegisterRequest, UserResponse

ACCESS_TOKEN_COOKIE = "organix_access_token"
router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])


def set_auth_cookie(
    response: Response,
    user: User,
    remember_me: bool = False,
) -> None:
    lifetime = (
        timedelta(days=settings.REMEMBER_ME_EXPIRE_DAYS)
        if remember_me
        else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    response.set_cookie(
        key=ACCESS_TOKEN_COOKIE,
        value=create_access_token(user.id, remember_me),
        max_age=int(lifetime.total_seconds()) if remember_me else None,
        httponly=True,
        secure=settings.APP_ENV.lower() not in {"development", "dev", "test"},
        samesite="lax",
        path="/",
    )


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),  # noqa: B008
) -> User:
    token = request.cookies.get(ACCESS_TOKEN_COOKIE)
    subject = get_token_subject(token) if token else None
    if subject is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication is required.",
        )

    try:
        user_id = UUID(subject)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication is required.",
        ) from None

    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication is required.",
        )
    return user


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    payload: RegisterRequest,
    response: Response,
    db: Session = Depends(get_db),  # noqa: B008
) -> User:
    email = str(payload.email).strip().lower()
    existing_user = db.scalar(select(User).where(User.email == email))
    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = User(
        full_name=payload.full_name,
        email=email,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        ) from None
    db.refresh(user)
    set_auth_cookie(response, user)
    return user


@router.post("/login", response_model=UserResponse)
def login(
    payload: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),  # noqa: B008
) -> User:
    email = str(payload.email).strip().lower()
    user = db.scalar(select(User).where(User.email == email))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    set_auth_cookie(response, user, payload.remember_me)
    return user


@router.get("/me", response_model=UserResponse)
def read_current_user(
    user: User = Depends(get_current_user),  # noqa: B008
) -> User:
    return user
