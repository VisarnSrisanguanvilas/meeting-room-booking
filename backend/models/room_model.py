from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from enum import Enum

class RoomStatus(str, Enum):
    AVAILABLE = "available"       
    RESERVED = "reserved"
    BOOKED = "booked"   
    
class RoomSize(int, Enum):
    SIX = 6
    EIGHT = 8
    TEN = 10


class Room(SQLModel, table=True):
    __tablename__ = "rooms"

    id: Optional[int] = Field(default=None, primary_key=True)
    room_name: str = Field(index=True, unique=True)
    size: RoomSize
    price: float
    status: RoomStatus = Field(default=RoomStatus.AVAILABLE)
    creator_id: int = Field(foreign_key="users.id")

    creator: Optional["User"] = Relationship(back_populates="rooms") # type: ignore
    bookings: List["Booking"] = Relationship(back_populates="room") # type: ignore
