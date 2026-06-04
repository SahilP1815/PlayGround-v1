from beanie import Document, Link
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
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
    BASKETBALL = "basketball"
    HOCKEY = "hockey"
    OTHER = "other"

class GroundStatus(str, Enum):
    DRAFT = "draft"
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"
    SUSPENDED = "suspended"

class CancellationPolicy(str, Enum):
    HOURS_18 = "18_hours"     # Cancel up to 18h before
    FLEXIBLE = "flexible"     # Cancel up to 24h before → full refund
    MODERATE = "moderate"     # Cancel up to 48h before → 50% refund
    STRICT = "strict"         # No cancellation allowed

class SlotType(str, Enum):
    REGULAR = "regular"
    PEAK = "peak"
    OFF_PEAK = "off_peak"

class TimeSlot(BaseModel):
    days: List[str] # ["Monday", "Tuesday", ...]
    start_time: str # "06:00"
    end_time: str # "09:00"
    price_per_hour: float
    slot_type: SlotType = SlotType.REGULAR
    sport_type: Optional[str] = None

class Court(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    name: str
    sport_type: SportType
    base_price: float
    is_active: bool = True
    surface_type: Optional[str] = None
    ground_size: Optional[str] = None
    max_players: Optional[int] = None
    is_indoor: Optional[bool] = None

class Location(BaseModel):
    lat: float
    lng: float
    address: str
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    landmark: Optional[str] = None

class VerificationDocs(BaseModel):
    property_proof: Optional[str] = None # URL to doc
    gov_id: Optional[str] = None
    municipal_permission: Optional[str] = None
    bank_details: Optional[str] = None

class Ground(Document):
    owner_id: str
    assigned_handler_id: Optional[str] = None
    name: str
    description: str
    location: Location
    surface_type: Optional[str] = None
    ground_size: Optional[str] = None
    max_players: Optional[int] = None
    is_indoor: bool = False
    images: List[str] = []
    video_url: Optional[str] = None
    amenities: List[str] = []
    courts: List[Court] = []
    time_slots: List[TimeSlot] = []
    
    # Booking Rules
    advance_booking_days: int = 30
    cancellation_policy: CancellationPolicy = CancellationPolicy.FLEXIBLE
    min_booking_duration: float = 1.0
    security_deposit: float = 0.0
    
    # Ratings
    avg_rating: Optional[float] = None
    review_count: int = 0
    
    status: GroundStatus = GroundStatus.DRAFT
    verification_docs: Optional[VerificationDocs] = None
    rejection_reason: Optional[str] = None
    
    # Extra fields for API response (not stored in DB if not needed, but here they help with Pydantic validation)
    min_price: Optional[float] = None
    sports: Optional[List[str]] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "grounds"
