from pydantic import BaseModel, Field, field_validator
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
    amenities: List[str] = []

class GroundCreate(GroundBase):
    courts: List[CourtCreate] = []

class GroundUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[LocationBase] = None
    images: Optional[List[str]] = None
    amenities: Optional[List[str]] = None
    courts: Optional[List[CourtCreate]] = None

class GroundResponse(GroundBase):
    id: str
    owner_id: str
    courts: List[CourtResponse]

    class Config:
        from_attributes = True

    @field_validator("id", mode="before")
    @classmethod
    def convert_objectid_to_str(cls, v):
        return str(v)

