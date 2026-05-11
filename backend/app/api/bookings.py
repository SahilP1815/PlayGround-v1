from fastapi import APIRouter, Depends, HTTPException, status
from app.models.booking import Booking, Slot, SlotStatus, BookingStatus
from app.models.user import User
from app.api.deps import get_current_user
from typing import List, Any
import uuid

router = APIRouter()

@router.post("/")
async def create_booking(
    slot_id: str,
    current_user: User = Depends(get_current_user)
) -> Any:
    # 1. Fetch the slot
    slot = await Slot.get(slot_id)
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    
    if slot.status != SlotStatus.AVAILABLE:
        raise HTTPException(status_code=400, detail="Slot is no longer available")
    
    # 2. Update slot status to BOOKED
    slot.status = SlotStatus.BOOKED
    await slot.save()
    
    # 3. Create the booking
    booking = Booking(
        user_id=str(current_user.id),
        slot_id=str(slot.id),
        ground_id=slot.ground_id,
        court_id=slot.court_id,
        total_price=slot.price,
        status=BookingStatus.CONFIRMED,
        booking_id=f"BK-{uuid.uuid4().hex[:8].upper()}"
    )
    await booking.insert()
    
    return booking

@router.get("/my")
async def get_my_bookings(current_user: User = Depends(get_current_user)) -> Any:
    bookings = await Booking.find(Booking.user_id == str(current_user.id)).to_list()
    return bookings
