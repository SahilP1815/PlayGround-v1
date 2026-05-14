from beanie import Document, Link
from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum
from datetime import datetime
from uuid import UUID, uuid4

class SportType(str, Enum):
    CRICKET = "cricket"
    FOOTBALL = "football"
    BADMINTON = "badminton"
    PICKLEBALL = "pickleball"
    VOLLEYBALL = "volleyball"
    TENNIS = "tennis"

class Court(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    name: str
    sport_type: SportType
    base_price: float
    is_active: bool = True

class Location(BaseModel):
    lat: float
    lng: float
    address: str

class Ground(Document):
    owner_id: str # Link to User._id
    name: str
    description: str
    location: Location
    images: List[str] = []
    amenities: List[str] = []
    courts: List[Court] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "grounds"
