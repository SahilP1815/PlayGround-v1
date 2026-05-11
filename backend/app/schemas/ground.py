from pydantic import BaseModel, Field
from typing import List, Optional
from app.models.ground import SportType
from uuid import UUID

class CourtBase(BaseModel):
    name: str
    sport_type: SportType
    base_price: float

class CourtCreate(CourtBase):
    pass

class CourtResponse(CourtBase):
    id: UUID

class LocationBase(BaseModel):
    lat: float
    lng: float
    address: str

class GroundBase(BaseModel):
    name: str
    description: str
    location: LocationBase
    images: List[str] = []

class GroundCreate(GroundBase):
    courts: List[CourtCreate] = []

class GroundResponse(GroundBase):
    id: str
    owner_id: str
    courts: List[CourtResponse]

    class Config:
        from_attributes = True
