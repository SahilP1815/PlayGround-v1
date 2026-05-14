from fastapi import APIRouter, Depends, HTTPException, status
from beanie.operators import In
from app.models.booking import Booking, Slot, SlotStatus, BookingStatus
from app.models.user import User
from app.api.deps import get_current_user
from typing import List, Any
import uuid
from datetime import datetime

router = APIRouter()

from pydantic import BaseModel
from typing import List, Any
import uuid
from datetime import datetime

class BookingCreate(BaseModel):
    ground_id: str
    court_id: str
    slots: List[datetime]
    total_price: float

@router.post("/")
async def create_booking(
    booking_in: BookingCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    if not booking_in.slots:
        raise HTTPException(status_code=400, detail="No slots selected")

    # 1. Sort slots to find continuous ones
    sorted_slots = sorted(booking_in.slots)
    
    # 2. Check if any slot is already booked (Individual slot check remains for safety)
    for start_time in sorted_slots:
        existing = await Booking.find_one(
            Booking.ground_id == booking_in.ground_id,
            Booking.court_id == booking_in.court_id,
            Booking.status == BookingStatus.CONFIRMED,
            # Check if this start_time falls within any existing booking range
            Booking.start_time <= start_time,
            Booking.end_time > start_time
        )
        if existing:
            time_str = start_time.strftime('%I:%M %p')
            raise HTTPException(status_code=400, detail=f"Slot at {time_str} is already booked")

    # 3. Group continuous slots
    from datetime import timedelta
    groups = []
    if sorted_slots:
        current_group = [sorted_slots[0]]
        for i in range(1, len(sorted_slots)):
            # If the next slot starts exactly when the previous one ends (1 hour later)
            if sorted_slots[i] == sorted_slots[i-1] + timedelta(hours=1):
                current_group.append(sorted_slots[i])
            else:
                groups.append(current_group)
                current_group = [sorted_slots[i]]
        groups.append(current_group)

    # 4. Create bookings for each group
    created_bookings = []
    for group in groups:
        start_t = group[0]
        end_t = group[-1] + timedelta(hours=1)
        
        # Calculate price for this block
        # (Since we don't have per-slot prices here easily, we estimate based on total)
        group_price = (booking_in.total_price / len(booking_in.slots)) * len(group)

        booking = Booking(
            user_id=str(current_user.id),
            ground_id=booking_in.ground_id,
            court_id=booking_in.court_id,
            start_time=start_t,
            end_time=end_t,
            total_price=group_price,
            status=BookingStatus.CONFIRMED,
            booking_id=f"BK-{uuid.uuid4().hex[:8].upper()}"
        )
        await booking.insert()
        created_bookings.append(booking)
    
    return created_bookings

from app.models.ground import Ground

@router.get("/my")
async def get_my_bookings(current_user: User = Depends(get_current_user)) -> Any:
    bookings = await Booking.find(Booking.user_id == str(current_user.id)).to_list()
    
    enriched_bookings = []
    for b in bookings:
        ground = await Ground.get(b.ground_id)
        court_name = "Unknown Court"
        if ground:
            for c in ground.courts:
                if str(c.id) == str(b.court_id):
                    court_name = c.name
                    break
        
        # Convert start_time to local string or keep as datetime
        enriched_bookings.append({
            "id": str(b.id),
            "booking_id": b.booking_id,
            "ground_name": ground.name if ground else "Unknown Ground",
            "ground_address": ground.location.address if ground else "Unknown Address",
            "ground_image": ground.images[0] if ground and ground.images else None,
            "court_name": court_name,
            "start_time": b.start_time.strftime('%Y-%m-%dT%H:%M:%S.000Z'),
            "end_time": b.end_time.strftime('%Y-%m-%dT%H:%M:%S.000Z') if b.end_time else None,
            "total_price": b.total_price,
            "status": b.status,
            "created_at": b.created_at.strftime('%Y-%m-%dT%H:%M:%S.000Z')
        })
    return enriched_bookings

@router.get("/owner")
async def get_owner_bookings(current_user: User = Depends(get_current_user)) -> Any:
    # 1. Find all grounds owned by this owner
    grounds = await Ground.find(Ground.owner_id == str(current_user.id)).to_list()
    ground_ids = [str(g.id) for g in grounds]
    
    # 2. Find all bookings for these grounds
    bookings = await Booking.find(In(Booking.ground_id, ground_ids)).to_list()
    
    enriched_bookings = []
    for b in bookings:
        # Get ground and court name
        ground = next((g for g in grounds if str(g.id) == b.ground_id), None)
        court_name = "Unknown Court"
        if ground:
            for c in ground.courts:
                if str(c.id) == b.court_id:
                    court_name = c.name
                    break
        
        # Get customer info
        customer = await User.get(b.user_id)
        
        enriched_bookings.append({
            "id": str(b.id),
            "booking_id": b.booking_id,
            "customer_name": customer.name if customer else "Unknown",
            "customer_email": customer.email if customer else "N/A",
            "ground_name": ground.name if ground else "Unknown",
            "court_name": court_name,
            "start_time": b.start_time.strftime('%Y-%m-%dT%H:%M:%S.000Z'),
            "end_time": b.end_time.strftime('%Y-%m-%dT%H:%M:%S.000Z') if b.end_time else None,
            "total_price": b.total_price,
            "status": b.status,
            "created_at": b.created_at.strftime('%Y-%m-%dT%H:%M:%S.000Z')
        })
    
    return enriched_bookings

@router.get("/booked-slots/{court_id}")
async def get_booked_slots(court_id: str):
    bookings = await Booking.find(
        Booking.court_id == court_id,
        Booking.status == BookingStatus.CONFIRMED
    ).to_list()
    
    from datetime import timedelta
    all_slots = []
    for b in bookings:
        curr = b.start_time
        # If end_time is not set, assume 1 hour slot
        end = b.end_time if b.end_time else b.start_time + timedelta(hours=1)
        
        while curr < end:
            all_slots.append(curr.strftime('%Y-%m-%dT%H:%M:%S.000Z'))
            curr += timedelta(hours=1)
            
    return list(set(all_slots)) # Return unique slots
