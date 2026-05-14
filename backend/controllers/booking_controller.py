from datetime import datetime, time
from fastapi import APIRouter, HTTPException, Request, Depends
from sqlmodel import Session, select
from configs.db import get_session
from models.booking_model import Booking, BookingStatus
from models.room_model import RoomStatus
from models.user_model import User
from schemas.booking_schema import BookingCreate
from utils.token import decode_token
from models.room_model import Room
router = APIRouter(prefix="/bookings", tags=["Bookings"])

#/user
@router.post("/", response_model=Booking)
def create_booking(data: BookingCreate,request: Request,session: Session = Depends(get_session),):
    token = request.headers.get("authorization")
    if not token:
        raise HTTPException(401, "Missing token")

    payload = decode_token(token.replace("Bearer ", ""))

    if payload.get("role") != "user":
        raise HTTPException(403, "User only")

    user = session.get(User, payload["id"])
    if not user:
        raise HTTPException(404, "User not found")

    room = session.get(Room, data.room_id)
    if not room:
        raise HTTPException(404, "Room not found")

    if room.status != RoomStatus.AVAILABLE:
        raise HTTPException(400, "Room not available")

    if data.start_hour >= data.end_hour:
        raise HTTPException(400, "Invalid hour range")

    if data.end_hour > 18:
        raise HTTPException(400, "Booking cannot end after 18:00")

    hours = data.end_hour - data.start_hour

    start_time = datetime.combine(data.date, time(data.start_hour))
    end_time = datetime.combine(data.date, time(data.end_hour))

    if start_time < datetime.now():
        raise HTTPException(400, "Cannot book in the past")

    overlap = session.exec(
        select(Booking).where(
            Booking.room_id == data.room_id,
            Booking.start_time < end_time,
            Booking.end_time > start_time,
        )
    ).first()

    if overlap:
        raise HTTPException(400, "Time slot already booked")

    total_price = hours * room.price

    if user.wallet < total_price:
        raise HTTPException(400, "Insufficient balance")

    user.wallet -= total_price

    booking = Booking(
        room_id=data.room_id,
        user_id=user.id,
        start_time=start_time,
        end_time=end_time,
        status=BookingStatus.PENDING,
    )

    session.add_all([booking, user])
    session.commit()
    session.refresh(booking)

    return booking

#/user/calendar
@router.get("/me")
def my_bookings( request: Request, session: Session = Depends(get_session),):
    token = request.headers.get("authorization")
    if not token:
        raise HTTPException(401, "Missing token")

    payload = decode_token(token.replace("Bearer ", ""))
    
    if payload.get("role") != "user":
        raise HTTPException(403, "User only")

    user = session.get(User, payload["id"])
    if not user:
        raise HTTPException(404, "User not found")

    bookings = session.exec(
        select(Booking).where(Booking.user_id == user.id)
    ).all()

    return [
        {
            **b.dict(),
            "room_name": b.room.room_name if b.room else None,
        }
        for b in bookings
    ]

#/admin/calendar
@router.get("/all")
def get_all_bookings(request: Request,session: Session = Depends(get_session),):
    token = request.headers.get("authorization")
    if not token:
        raise HTTPException(401, "Missing token")

    token = token.replace("Bearer ", "")
    payload = decode_token(token)
    
    if payload.get("role") != "admin":
        raise HTTPException(403, "Admin only")

    stmt = select(Booking)
    bookings = session.exec(stmt).all()

    return [
        {
            **b.dict(),
            "room_name": b.room.room_name,
        }
        for b in bookings
    ]

#/admin 
@router.patch("/{booking_id}/reject", response_model=Booking)
def reject_booking(booking_id: int, request: Request, session: Session = Depends(get_session),):
    token = request.headers.get("authorization")
    if not token:
        raise HTTPException(401, "Missing token")

    token = token.replace("Bearer ", "")
    payload = decode_token(token)

    if payload.get("role") != "admin":
        raise HTTPException(403, "Admin only")

    booking = session.get(Booking, booking_id)
    if not booking:
        raise HTTPException(404, "Booking not found")

    if booking.status != BookingStatus.PENDING:
        raise HTTPException(400, "Only pending booking can be rejected")

    room = session.get(Room, booking.room_id)
    user = session.get(User, booking.user_id)

    if not room or not user:
        raise HTTPException(404, "Room/User not found")

    hours = (booking.end_time - booking.start_time).total_seconds() / 3600
    refund = hours * room.price
    
    booking.status = BookingStatus.REJECTED

    user.wallet += refund

    session.add(booking)
    session.add(user)
    session.commit()
    session.refresh(booking)

    return booking
#/admin
@router.patch("/{booking_id}/confirm", response_model=Booking)
def confirm_booking(booking_id: int, request: Request, session: Session = Depends(get_session),):
    token = request.headers.get("authorization")
    if not token:
        raise HTTPException(401, "Missing token")

    token = token.replace("Bearer ", "")
    payload = decode_token(token)

    if payload.get("role") != "admin":
        raise HTTPException(403, "Admin only")

    admin = session.get(User, payload["id"])
    if not admin:
        raise HTTPException(404, "Admin not found")

    booking = session.get(Booking, booking_id)
    if not booking:
        raise HTTPException(404, "Booking not found")

    if booking.status != BookingStatus.PENDING:
        raise HTTPException(400, "Only pending booking can be confirmed")

    room = session.get(Room, booking.room_id)
    if not room:
        raise HTTPException(404, "Room not found")

    hours = (booking.end_time - booking.start_time).total_seconds() / 3600
    total_price = hours * room.price

    admin.wallet += total_price
    
    booking.status = BookingStatus.CONFIRMED

    session.add_all([booking, admin])
    session.commit()
    session.refresh(booking)

    return booking
