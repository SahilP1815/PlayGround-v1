from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from app.models.ground import SportType, GroundStatus, SlotType
from uuid import UUID

class TimeSlotBase(BaseModel):
    days: List[str]
    start_time: str
    end_time: str
    price_per_hour: float
    slot_type: SlotType
    sport_type: Optional[str] = None

class CourtBase(BaseModel):
    name: str
    sport_type: SportType
    base_price: float
    surface_type: Optional[str] = None
    ground_size: Optional[str] = None
    max_players: Optional[int] = None
    is_indoor: Optional[bool] = None

class CourtCreate(CourtBase):
    pass

class CourtResponse(CourtBase):
    id: UUID

class LocationBase(BaseModel):
    lat: float
    lng: float
    address: str
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    landmark: Optional[str] = None

class VerificationDocsBase(BaseModel):
    property_proof: Optional[str] = None
    gov_id: Optional[str] = None
    municipal_permission: Optional[str] = None
    bank_details: Optional[str] = None

class GroundBase(BaseModel):
    name: str
    description: str
    location: LocationBase
    surface_type: Optional[str] = None
    ground_size: Optional[str] = None
    max_players: Optional[int] = None
    is_indoor: bool = False
    images: List[str] = []
    video_url: Optional[str] = None
    amenities: List[str] = []
    advance_booking_days: int = 30
    cancellation_policy: str = "flexible"
    min_booking_duration: float = 1.0
    security_deposit: float = 0.0

class GroundCreate(GroundBase):
    courts: List[CourtCreate] = []
    time_slots: List[TimeSlotBase] = []
    verification_docs: Optional[VerificationDocsBase] = None

class GroundUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[LocationBase] = None
    surface_type: Optional[str] = None
    ground_size: Optional[str] = None
    max_players: Optional[int] = None
    is_indoor: Optional[bool] = None
    images: Optional[List[str]] = None
    video_url: Optional[str] = None
    amenities: Optional[List[str]] = None
    courts: Optional[List[CourtCreate]] = None
    time_slots: Optional[List[TimeSlotBase]] = None
    advance_booking_days: Optional[int] = None
    cancellation_policy: Optional[str] = None
    min_booking_duration: Optional[float] = None
    security_deposit: Optional[float] = None
    status: Optional[GroundStatus] = None
    verification_docs: Optional[VerificationDocsBase] = None

class GroundResponse(GroundBase):
    id: str
    owner_id: str
    status: GroundStatus
    courts: List[CourtResponse]
    time_slots: List[TimeSlotBase]
    verification_docs: Optional[VerificationDocsBase]
    avg_rating: Optional[float] = None
    review_count: int = 0
    min_price: Optional[float] = None
    sports: Optional[List[str]] = None

    class Config:
        from_attributes = True

    @field_validator("id", mode="before")
    @classmethod
    def convert_objectid_to_str(cls, v):
        return str(v)
