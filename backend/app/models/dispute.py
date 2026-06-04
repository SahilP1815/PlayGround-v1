from beanie import Document, Indexed
from pydantic import Field
from typing import Optional
from datetime import datetime

class Dispute(Document):
    booking_id: Indexed(str)
    user_id: str
    ground_id: str
    reason_category: str # "Denial of Entry", "Double Booking", "Poor Facilities", "Other"
    description: str
    status: str = "open" # "open", "resolved"
    resolution: Optional[str] = None # "refunded", "released"
    admin_notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "disputes"
