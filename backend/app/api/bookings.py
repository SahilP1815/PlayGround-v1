from fastapi import APIRouter, Depends, HTTPException, status
from app.models.booking import Booking, Slot, SlotStatus, BookingStatus
from app.models.user import User
from app.api.deps import get_current_user
from typing import List, Any
import uuid
from datetime import datetime
from app.db.mock_db import MockDB

router = APIRouter()

@router.post("/")
async def create_booking(
    slot_ids: List[str],
    current_user: User = Depends(get_current_user)
) -> Any:
    # Use Mock Mode for persistence
    total_price = len(slot_ids) * 1200 # Mock pricing for now
    
    booking_dict = {
        "user_id": str(current_user.id),
        "slot_ids": slot_ids,
        "ground_id": "1", # Mock ground
        "court_id": "c1",
        "total_price": total_price,
        "status": "confirmed",
        "booking_id": f"BK-{uuid.uuid4().hex[:8].upper()}",
        "created_at": datetime.utcnow().isoformat()
    }
    
    MockDB.add_booking(booking_dict)
    return booking_dict

@router.get("/my")
async def get_my_bookings(current_user: User = Depends(get_current_user)) -> Any:
    # Fetch from Mock JSON store
    return MockDB.get_user_bookings(str(current_user.id))
