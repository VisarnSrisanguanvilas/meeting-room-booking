from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    password: str
    role: str = Field(default="user")
    wallet: float = Field(default=0.0)

    rooms: List["Room"] = Relationship(back_populates="creator") # type: ignore
    bookings: List["Booking"] = Relationship(back_populates="user") # type: ignore
