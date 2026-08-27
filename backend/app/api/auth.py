from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import bcrypt
from jose import jwt, JWTError
from app.database import get_db
from app.models import User, UserRole
from app.schemas import UserCreate, UserLogin, TokenResponse, UserOut
from app.config import get_settings
import uuid

router = APIRouter()
settings = get_settings()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(12)).decode('utf-8')


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))


def create_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(
        {"sub": user_id, "exp": expire},
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )


@router.post("/register", response_model=TokenResponse)
def register(data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        id=str(uuid.uuid4()),
        full_name=data.full_name,
        email=data.email,
        password_hash=hash_password(data.password),
        preferred_language=data.preferred_language,
        role=UserRole.USER,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return TokenResponse(
        access_token=create_token(user.id),
        user_id=user.id,
        full_name=user.full_name,
        email=user.email,
        preferred_language=user.preferred_language,
    )


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user.last_login = datetime.utcnow()
    db.commit()
    return TokenResponse(
        access_token=create_token(user.id),
        user_id=user.id,
        full_name=user.full_name,
        email=user.email,
        preferred_language=user.preferred_language,
    )


@router.get("/me", response_model=UserOut)
def me(db: Session = Depends(get_db)):
    """Returns demo user for hackathon. Full JWT auth can be added later."""
    demo = db.query(User).filter(User.email == "demo@normai.in").first()
    if not demo:
        raise HTTPException(status_code=404, detail="Demo user not seeded")
    return demo
