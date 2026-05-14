from datetime import datetime, date, time
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlmodel import Session, delete, select
from configs.db import get_session
from models.booking_model import Booking
from models.room_model import Room, RoomSize
from schemas.room_schema import RoomCreate, RoomUpdate

from utils.token import decode_token

router = APIRouter(prefix="/rooms", tags=["Rooms"])

#admin/room
@router.post("/", response_model=Room)
def create_room(data: RoomCreate,request: Request,session: Session = Depends(get_session),current_user_id: int = 1):
    token = request.headers.get("authorization")
    if not token:
        raise HTTPException(401, "Missing token")

    token = token.replace("Bearer ", "")
    payload = decode_token(token)
    
    if payload.get("role") != "admin":
        raise HTTPException(403, "Admin only")
    
    room = Room(
    room_name=data.room_name,
    size=RoomSize(data.size),
    price=data.price,
    creator_id=current_user_id,
    )

    session.add(room)
    session.commit()
    session.refresh(room)

    return room

#/user /admin/rooms
@router.get("/", response_model=list[Room])
def get_rooms(request: Request,session: Session = Depends(get_session)):
    token = request.headers.get("authorization")
    if not token:
        raise HTTPException(401, "Missing token")

    token = token.replace("Bearer ", "")
    payload = decode_token(token)
    
    if payload.get("role") not in ["admin", "user"]:
        raise HTTPException(403, "Admin or user only")

    return session.exec(select(Room)).all()


@router.put("/{room_id}", response_model=Room)
def update_room(room_id: int,data: RoomUpdate,request: Request,session: Session = Depends(get_session),current_user_id: int = 1):
    token = request.headers.get("authorization")
    if not token:
        raise HTTPException(401, "Missing token")   
    
    
    token = token.replace("Bearer ", "")
    payload = decode_token(token)
    
    if payload.get("role") != "admin":
        raise HTTPException(403, "Admin only")

    room = session.get(Room, room_id)

    if not room:
        raise HTTPException(404, "Room not found")

    if room.creator_id != current_user_id:
        raise HTTPException(403, "Not your room")

    update_data = data.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(room, key, value)

    session.add(room)
    session.commit()
    session.refresh(room)

    return room

#/admin/room
@router.delete("/{room_id}")
def delete_room(room_id: int,request: Request,session: Session = Depends(get_session),current_user_id: int = 1):
    token = request.headers.get("authorization")
    if not token:
        raise HTTPException(401, "Missing token")

    token = token.replace("Bearer ", "")
    payload = decode_token(token)
    if payload.get("role") != "admin":
        raise HTTPException(403, "Admin only")    
    
    room = session.get(Room, room_id)
    if not room:
        raise HTTPException(404, "Room not found")

    session.exec(
        delete(Booking).where(Booking.room_id == room_id)
    )

    session.delete(room)
    session.commit()

    return {"message": "Deleted successfully"}

#user/ component
@router.get("/availability")
def get_room_availability(
    date: date,
    request: Request,
    session: Session = Depends(get_session),
):
    token = request.headers.get("authorization")
    if not token:
        raise HTTPException(401, "Missing token")

    payload = decode_token(token.replace("Bearer ", ""))

    if payload.get("role") not in ["user"]:
        raise HTTPException(403, "user only")

    rooms = session.exec(select(Room)).all()

    day_start = datetime.combine(date, time(9))
    day_end = datetime.combine(date, time(18))

    bookings = session.exec(
        select(Booking).where(
            Booking.start_time < day_end,
            Booking.end_time > day_start,
        )
    ).all()

    result = []

    for room in rooms:
        room_bookings = [b for b in bookings if b.room_id == room.id]

        slots = []

        for hour in range(9, 18):
            start = hour
            end = hour + 1

            is_booked = any(
                not (
                    end <= b.start_time.hour or
                    start >= b.end_time.hour
                )
                for b in room_bookings
            )

            slots.append({
                "start": start,
                "end": end,
                "available": not is_booked
            })

        result.append({
            "room_id": room.id,
            "room_name": room.room_name,
            "slots": slots
        })

    return result