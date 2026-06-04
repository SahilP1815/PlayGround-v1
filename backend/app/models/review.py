from beanie import Document
from pydantic import Field
from datetime import datetime
from typing import Optional

class Review(Document):
    ground_id: str
    user_id: str
    booking_id: str # One review per booking
    rating: int = Field(ge=1, le=5)
    comment: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "reviews"
