from beanie import Document, Indexed
from pydantic import Field
from typing import Optional
from enum import Enum
from datetime import datetime

class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class SlotStatus(str, Enum):
    AVAILABLE = "available"
    BOOKED = "booked"
    BLOCKED = "blocked"

class Slot(Document):
    ground_id: str
    court_id: str
    start_time: Indexed(datetime)
    end_time: datetime
    price: float
    status: SlotStatus = SlotStatus.AVAILABLE

    class Settings:
        name = "slots"

class Booking(Document):
    user_id: str
    slot_id: str
    ground_id: str
    court_id: str
    total_price: float
    status: BookingStatus = BookingStatus.PENDING
    booking_id: str # Human readable ID
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "bookings"
