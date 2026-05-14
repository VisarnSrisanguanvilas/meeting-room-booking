from datetime import datetime, date as Date
from typing import Optional
from sqlmodel import Field, SQLModel


class BookingCreate(SQLModel):
    room_id: int
    date: Date
    start_hour: int = Field(ge=9, le=17)
    end_hour: int = Field(ge=10, le=18)


class BookingUpdate(SQLModel):
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[str] = None


class BookingRead(SQLModel):
    id: int
    room_id: int
    user_id: int
    start_time: datetime
    end_time: datetime
    status: str
