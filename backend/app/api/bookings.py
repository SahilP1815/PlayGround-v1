from fastapi import APIRouter, Depends, HTTPException, status
from app.models.booking import Booking, Slot, SlotStatus, BookingStatus
from app.models.user import User
from app.api.deps import get_current_user
from typing import List, Any
import uuid
from datetime import datetime

router = APIRouter()

@router.post("/")
async def create_booking(
    slot_ids: List[str],
    current_user: User = Depends(get_current_user)
) -> Any:
    # Basic implementation using MongoDB
    # In a real app, you'd check slot availability, calculate price, etc.
    total_price = len(slot_ids) * 1200  # Mock pricing for now
    
    bookings = []
    for slot_id in slot_ids:
        # Check if slot exists and is available
        slot = await Slot.get(slot_id)
        if not slot or slot.status != SlotStatus.AVAILABLE:
            raise HTTPException(status_code=400, detail=f"Slot {slot_id} is not available")
            
        booking = Booking(
            user_id=str(current_user.id),
            slot_id=slot_id,
            ground_id=slot.ground_id,
            court_id=slot.court_id,
            total_price=slot.price,
            status=BookingStatus.CONFIRMED,
            booking_id=f"BK-{uuid.uuid4().hex[:8].upper()}"
        )
        await booking.insert()
        
        # Update slot status
        slot.status = SlotStatus.BOOKED
        await slot.save()
        bookings.append(booking)
    
    return bookings

@router.get("/my")
async def get_my_bookings(current_user: User = Depends(get_current_user)) -> Any:
    # Fetch from MongoDB
    bookings = await Booking.find(Booking.user_id == str(current_user.id)).to_list()
    return bookings
