from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from models.user_model import User
from configs.db import get_session
from utils.token import create_token
from schemas.login_schema import LoginRequest


router = APIRouter(prefix="/login", tags=["Login"])

#login /login
@router.post("/")
def login(payload: LoginRequest, session: Session = Depends(get_session)):
    user = session.exec(
        select(User).where(User.email == payload.email)
    ).first()

    if not user or user.password != payload.password:
        raise HTTPException(401, "Invalid email or password")

    token = create_token({
        "id": user.id,
        "email": user.email,
        "role": user.role,
    })

    return {"access_token": token}