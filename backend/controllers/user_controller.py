from fastapi import Depends, APIRouter, HTTPException, Request
from sqlmodel import(Session, select)
from models.user_model import User
from configs.db import get_session
from schemas.user_schema import UserCreate, TopupRequest
from utils.token import decode_token
from models.booking_model import Booking, BookingStatus
from models.room_model import Room, RoomStatus

router = APIRouter(prefix="/users", tags=["Users"])

#signin /signin
@router.post("/user")
def create_user(payload: UserCreate, session: Session = Depends(get_session)):
    user = User(email=str(payload.email), password=str(payload.password))
    session.add(user)
    session.commit()
    session.refresh(user)

    return user

#/user 
@router.get("/dashboard-user")
def user_dashboard(
    request: Request,
    session: Session = Depends(get_session)
):
    token = request.headers.get("authorization")

    if not token:
        raise HTTPException(401, "Missing token")

    token = token.replace("Bearer ", "")

    user_data = decode_token(token)

    if user_data.get("role") != "user":
        raise HTTPException(403, "User only")

    user_id = user_data["id"]

    user = session.get(User, user_id)

    bookings = session.exec(
        select(Booking).where(Booking.user_id == user_id)
    ).all()

    total = len(bookings)
    pending = len([b for b in bookings if b.status == BookingStatus.PENDING])
    confirmed = len([b for b in bookings if b.status == BookingStatus.CONFIRMED])

    bookings_data = [
        {
            "id": b.id,
            "user_email": b.user.email,
            "room_id": b.room_id,
            "room_name": b.room.room_name if b.room else None,
            "start_time": b.start_time,
            "end_time": b.end_time,
            "status": b.status,
        }
        for b in bookings
    ]
    
    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "wallet": user.wallet
        },
        "stats": {
            "total_bookings": total,
            "pending": pending,
            "confirmed": confirmed
        },
        "bookings": bookings_data
    }

# /admin 
@router.get("/dashboard-admin")
def admin_dashboard(
    request: Request,
    session: Session = Depends(get_session)
):
    token = request.headers.get("authorization")
    if not token:
        raise HTTPException(401, "Missing token")

    token = token.replace("Bearer ", "")
    payload = decode_token(token)

    if payload.get("role") != "admin":
        raise HTTPException(403, "Admin only")

    admin_id = payload["id"]
    admin = session.get(User, admin_id)

    users = session.exec(select(User)).all()
    rooms = session.exec(select(Room)).all()
    bookings = session.exec(select(Booking)).all()

    total_bookings = len(bookings)

    pending = sum(1 for b in bookings if b.status == BookingStatus.PENDING)
    confirmed = sum(1 for b in bookings if b.status == BookingStatus.CONFIRMED)
    rejected = sum(1 for b in bookings if b.status == BookingStatus.REJECTED)

    latest_bookings = (
    session.query(Booking)
    .order_by(Booking.start_time.desc())
    .limit(10)
    .all()
    )
    latest_bookings_data = [
        {
            "booking_id": b.id,
            "user_email": b.user.email,
            "room_id": b.room_id,
            "room_name": b.room.room_name if b.room else None,
            "start_time": b.start_time,
            "end_time": b.end_time,
            "status": b.status,
        }
        for b in latest_bookings
    ]

    return {
        "admin": {
            "id": admin.id,
            "email": admin.email,
            "wallet": admin.wallet
        },
        "stats": {
            "users": len(users),
            "rooms": len(rooms),
            "bookings": total_bookings,
            "pending": pending,
            "confirmed": confirmed,
            "rejected": rejected
        },
        "latest_bookings": latest_bookings_data
    }

#/user/payment
@router.post("/topup")
def topup_wallet(
    payload: TopupRequest,
    request: Request,
    session: Session = Depends(get_session)
):
    token = request.headers.get("authorization")

    if not token:
        raise HTTPException(401, "Missing token")

    token = token.replace("Bearer ", "")

    user_data = decode_token(token)

    if user_data.get("role") != "user":
        raise HTTPException(403, "User only")

    user = session.get(User, user_data["id"])

    if not user:
        raise HTTPException(404, "User not found")

    if payload.amount <= 0:
        raise HTTPException(400, "Amount must be greater than 0")

    user.wallet += payload.amount

    session.add(user)
    session.commit()
    session.refresh(user)

    return {
        "message": "Topup success",
        "wallet": user.wallet
    }
