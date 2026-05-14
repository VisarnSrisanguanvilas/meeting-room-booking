# schemas/room_schema.py
from typing import Optional
from sqlmodel import SQLModel


class RoomCreate(SQLModel):
    room_name: str
    size: int
    price: float


class RoomUpdate(SQLModel):
    room_name: Optional[str] = None
    size: Optional[int] = None
    price: Optional[float] = None
    status: Optional[str] = None


class RoomRead(SQLModel):
    id: int
    room_name: str
    size: int
    price: float
    status: str
    creator_id: int
