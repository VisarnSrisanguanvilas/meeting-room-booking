from datetime import datetime
from typing import Optional
from sqlmodel import  SQLModel, Field, Relationship
from enum import Enum

class BookingStatus(str, Enum):
    PENDING = "pending"       
    CONFIRMED = "confirmed"   
    REJECTED = "rejected"     
    CANCELLED = "cancelled"  
    

class Booking(SQLModel, table=True):
    __tablename__ = "bookings"

    id: Optional[int] = Field(default=None, primary_key=True)

    room_id: int = Field(foreign_key="rooms.id")
    user_id: int = Field(foreign_key="users.id")

    start_time: datetime
    end_time: datetime
    status: BookingStatus = Field(default=BookingStatus.PENDING)

    room: Optional["Room"] = Relationship(back_populates="bookings") # type: ignore
    user: Optional["User"] = Relationship(back_populates="bookings") # type: ignore
