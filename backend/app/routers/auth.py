from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import User
from ..schemas import LoginRequest, LoginResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = (
        db.query(User)
        .filter(User.username == payload.username, User.password == payload.password)
        .first()
    )
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if user.system_type != "library":
        raise HTTPException(status_code=403, detail="Business/CRM login is disabled in this local setup")
    return LoginResponse(
        username=user.username,
        full_name=user.full_name,
        role="admin" if user.is_admin else "user",
        system_type=user.system_type,
    )
