from fastapi import APIRouter, Depends, HTTPException, status
from beanie.operators import In
from app.models.booking import Booking, Slot, SlotStatus, BookingStatus
from app.models.user import User
from app.models.ground import Ground
from app.api.deps import get_current_user
from typing import List, Any, Optional
from pydantic import BaseModel
import uuid
from datetime import datetime

router = APIRouter()

class BookingCreate(BaseModel):
    ground_id: str
    court_id: str
    slots: List[datetime]
    total_price: float

@router.post("")
async def create_booking(
    booking_in: BookingCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    if not booking_in.slots:
        raise HTTPException(status_code=400, detail="No slots selected")

    # 1. Sort slots to find continuous ones
    sorted_slots = sorted(booking_in.slots)

    # Check for past slots
    from datetime import timezone
    now = datetime.now(timezone.utc)
    for start_time in sorted_slots:
        start_time_utc = start_time if start_time.tzinfo else start_time.replace(tzinfo=timezone.utc)
        if start_time_utc < now:
            raise HTTPException(
                status_code=400,
                detail="Cannot book slots in the past"
            )
    
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
        sport_type = "Sports"
        if ground:
            for c in ground.courts:
                if str(c.id) == str(b.court_id):
                    court_name = c.name
                    sport_type = c.sport_type
                    break
        
        # Convert start_time to local string or keep as datetime
        enriched_bookings.append({
            "id": str(b.id),
            "booking_id": b.booking_id,
            "ground_id": str(b.ground_id),
            "ground_name": ground.name if ground else "Unknown Ground",
            "ground_address": ground.location.address if ground else "Unknown Address",
            "ground_image": ground.images[0] if ground and ground.images else None,
            "court_name": court_name,
            "sport_type": sport_type,
            "location": {
                "address": ground.location.address if ground else "Unknown Address",
                "city": ground.location.city if ground else "Ahmedabad"
            },
            "start_time": b.start_time.strftime('%Y-%m-%dT%H:%M:%S.000Z'),
            "end_time": b.end_time.strftime('%Y-%m-%dT%H:%M:%S.000Z') if b.end_time else None,
            "total_price": b.total_price,
            "status": b.status,
            "cancellation_policy": ground.cancellation_policy if ground else "flexible",
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
        sport_type = "Sports"
        if ground:
            for c in ground.courts:
                if str(c.id) == b.court_id:
                    court_name = c.name
                    sport_type = c.sport_type
                    break
        
        # Get customer info
        customer = await User.get(b.user_id)
        
        enriched_bookings.append({
            "id": str(b.id),
            "booking_id": b.booking_id,
            "ground_id": str(b.ground_id),
            "customer_name": customer.name if customer else "Unknown",
            "customer_email": customer.email if customer else "N/A",
            "ground_name": ground.name if ground else "Unknown",
            "court_name": court_name,
            "sport_type": sport_type,
            "location": {
                "address": ground.location.address if ground else "Unknown Address",
                "city": ground.location.city if ground else "Ahmedabad"
            },
            "start_time": b.start_time.strftime('%Y-%m-%dT%H:%M:%S.000Z'),
            "end_time": b.end_time.strftime('%Y-%m-%dT%H:%M:%S.000Z') if b.end_time else None,
            "total_price": b.total_price,
            "status": b.status,
            "cancellation_policy": ground.cancellation_policy if ground else "flexible",
            "created_at": b.created_at.strftime('%Y-%m-%dT%H:%M:%S.000Z')
        })
    
    return enriched_bookings

@router.get("/{booking_id}")
async def get_booking(
    booking_id: str,
    current_user: User = Depends(get_current_user)
) -> Any:
    # Try finding by human ID first, then Mongo ID
    booking = await Booking.find_one(Booking.booking_id == booking_id)
    if not booking:
        try:
            booking = await Booking.get(booking_id)
        except:
            booking = None
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    ground = await Ground.get(booking.ground_id)
    if not ground:
        raise HTTPException(status_code=404, detail="Ground not found")
    
    # Check permissions
    is_customer = booking.user_id == str(current_user.id)
    is_owner = ground.owner_id == str(current_user.id)
    is_admin = current_user.role == "admin"
    is_handler = False
    if current_user.is_handler:
        from app.models.handler import Handler
        handler = await Handler.find_one(Handler.user_id == str(current_user.id))
        if handler and ground.assigned_handler_id == str(handler.id):
            is_handler = True
    
    if not (is_customer or is_owner or is_admin or is_handler):
        raise HTTPException(status_code=403, detail="Not authorized to view this booking")
        
    # Return enriched data
    court_name = "Unknown Court"
    for c in ground.courts:
        if str(c.id) == booking.court_id:
            court_name = c.name
            break
                
    customer = await User.get(booking.user_id)
                
    return {
        "id": str(booking.id),
        "booking_id": booking.booking_id,
        "ground_id": booking.ground_id,
        "ground_name": ground.name,
        "ground_address": ground.location.address,
        "ground_image": ground.images[0] if ground.images else None,
        "court_name": court_name,
        "start_time": booking.start_time.strftime('%Y-%m-%dT%H:%M:%S.000Z'),
        "end_time": booking.end_time.strftime('%Y-%m-%dT%H:%M:%S.000Z') if booking.end_time else None,
        "total_price": booking.total_price,
        "status": booking.status,
        "cancellation_policy": ground.cancellation_policy,
        "customer_name": customer.name if customer else "Unknown",
        "customer_email": str(customer.email) if customer else "N/A"
    }

class CancelRequest(BaseModel):
    reason: Optional[str] = None

@router.post("/{booking_id}/cancel")
async def cancel_booking(
    booking_id: str,
    cancel_in: CancelRequest = None,
    current_user: User = Depends(get_current_user)
) -> Any:
    from app.models.ground import CancellationPolicy
    
    booking = await Booking.find_one(Booking.booking_id == booking_id)
    if not booking:
        try:
            booking = await Booking.get(booking_id)
        except:
            booking = None
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking.status == BookingStatus.CANCELLED:
        raise HTTPException(status_code=400, detail="Booking is already cancelled")

    ground = await Ground.get(booking.ground_id)
    if not ground:
        raise HTTPException(status_code=404, detail="Ground not found")

    is_customer = booking.user_id == str(current_user.id)
    is_owner = ground.owner_id == str(current_user.id)
    is_handler = False
    if current_user.is_handler:
        from app.models.handler import Handler
        handler = await Handler.find_one(Handler.user_id == str(current_user.id))
        if handler and ground.assigned_handler_id == str(handler.id) and handler.is_active:
            if not handler.can_cancel_bookings:
                raise HTTPException(status_code=403, detail="You do not have permission to cancel bookings")
            is_handler = True
    
    if not (is_customer or is_owner or is_handler):
        raise HTTPException(status_code=403, detail="Not authorized to cancel this booking")

    now = datetime.utcnow()
    hours_until_start = (booking.start_time - now).total_seconds() / 3600
    
    if hours_until_start < 0 and booking.status != BookingStatus.CANCELLED:
        raise HTTPException(status_code=400, detail="Cannot cancel a booking that has already started or completed")

    policy = ground.cancellation_policy
    refund_amount = 0.0
    message = ""

    if is_owner or is_handler:
        refund_amount = booking.total_price
        message = f"Cancelled by {current_user.role}. Full refund initiated."
        booking.cancelled_by = current_user.role
        booking.audit_log.append(f"{datetime.utcnow().isoformat()} - Cancelled by {current_user.role}: {current_user.name}")
    else:
        booking.cancelled_by = "user"
        booking.audit_log.append(f"{datetime.utcnow().isoformat()} - Cancelled by user: {current_user.name}")
        if policy == CancellationPolicy.FLEXIBLE:
            if hours_until_start >= 24:
                refund_amount = booking.total_price
                message = "Cancelled > 24h before. Full refund."
            else:
                refund_amount = 0
                message = "Cancelled < 24h before. No refund per flexible policy."
        elif policy == CancellationPolicy.MODERATE:
            if hours_until_start >= 48:
                refund_amount = booking.total_price
                message = "Cancelled > 48h before. Full refund."
            elif hours_until_start >= 24:
                refund_amount = booking.total_price * 0.5
                message = "Cancelled 24-48h before. 50% refund."
            else:
                refund_amount = 0
                message = "Cancelled < 24h before. No refund per moderate policy."
        elif policy == CancellationPolicy.STRICT:
            refund_amount = 0
            message = "Strict policy. No refund provided."

    booking.status = BookingStatus.CANCELLED
    booking.cancellation_reason = cancel_in.reason if cancel_in else None
    await booking.save()

    return {
        "booking_id": booking.booking_id,
        "refund_amount": refund_amount,
        "message": message
    }

@router.put("/{booking_id}/confirm")
@router.post("/{booking_id}/confirm")
async def confirm_booking(
    booking_id: str,
    current_user: User = Depends(get_current_user)
) -> Any:
    booking = await Booking.find_one(Booking.booking_id == booking_id)
    if not booking:
        try:
            booking = await Booking.get(booking_id)
        except:
            booking = None
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    ground = await Ground.get(booking.ground_id)
    if not ground:
        raise HTTPException(status_code=404, detail="Ground not found")
        
    is_owner = ground.owner_id == str(current_user.id)
    is_handler = False
    if current_user.is_handler:
        from app.models.handler import Handler
        handler = await Handler.find_one(Handler.user_id == str(current_user.id))
        if handler and ground.assigned_handler_id == str(handler.id) and handler.is_active:
            if not handler.can_confirm_bookings:
                raise HTTPException(status_code=403, detail="You do not have permission to confirm bookings")
            is_handler = True
            
    if not (is_owner or is_handler or current_user.role == "admin"):
        raise HTTPException(status_code=403, detail="Not authorized to confirm this booking")
        
    booking.status = BookingStatus.CONFIRMED
    booking.audit_log.append(f"{datetime.utcnow().isoformat()} - Confirmed by {current_user.role}: {current_user.name}")
    await booking.save()
    
    return {
        "message": "Booking confirmed",
        "booking_id": booking.booking_id,
        "status": booking.status
    }

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

@router.get("/owner/analytics")
async def get_owner_analytics(
    days: int = 30,
    current_user: User = Depends(get_current_user)
) -> Any:
    # 1. Auth check
    if current_user.role not in ["owner", "admin"]:
        raise HTTPException(status_code=403, detail="Only owners can access analytics")

    # 2. Get owner grounds
    grounds = await Ground.find(Ground.owner_id == str(current_user.id)).to_list()
    ground_ids = [str(g.id) for g in grounds]
    ground_map = {str(g.id): g for g in grounds}
    
    # 3. Get bookings
    bookings = await Booking.find(In(Booking.ground_id, ground_ids)).to_list()
    
    # 4. Compute Analytics
    from collections import defaultdict
    from datetime import timedelta
    
    now = datetime.utcnow()
    days = max(1, min(days, 365))
    start_filter = now - timedelta(days=days)
    
    # Filter bookings within range
    active_bookings = []
    for b in bookings:
        b_start = b.start_time.replace(tzinfo=None) if b.start_time.tzinfo else b.start_time
        if b_start >= start_filter:
            active_bookings.append(b)
            
    last_n_days = [(now - timedelta(days=i)).strftime('%Y-%m-%d') for i in range(days - 1, -1, -1)]
    
    revenue_by_day_map = defaultdict(float)
    revenue_by_ground_map = defaultdict(float)
    bookings_by_sport_map = defaultdict(int)
    peak_hours_map = defaultdict(int)
    
    total_revenue = 0.0
    confirmed_count = 0
    cancelled_count = 0
    
    for b in active_bookings:
        # Summary
        if b.status == BookingStatus.CONFIRMED:
            total_revenue += b.total_price
            confirmed_count += 1
            
            # Revenue by Day
            date_str = b.start_time.strftime('%Y-%m-%d')
            revenue_by_day_map[date_str] += b.total_price
            
            # Revenue by Ground
            ground = ground_map.get(b.ground_id)
            if ground:
                revenue_by_ground_map[ground.name] += b.total_price
                
                # Bookings by Sport
                court = next((c for c in ground.courts if str(c.id) == b.court_id), None)
                if court:
                    bookings_by_sport_map[court.sport_type] += 1
            
            # Peak Hours
            peak_hours_map[b.start_time.hour] += 1
            
        elif b.status == BookingStatus.CANCELLED:
            cancelled_count += 1

    # Format revenue_by_day
    revenue_by_day = [{"date": d, "revenue": revenue_by_day_map[d]} for d in last_n_days]
    
    # Format revenue_by_ground
    revenue_by_ground = [{"ground_name": name, "revenue": rev} for name, rev in revenue_by_ground_map.items()]
    
    # Format bookings_by_sport
    bookings_by_sport = [{"sport_type": sport, "count": count} for sport, count in bookings_by_sport_map.items()]
    
    # Format peak_hours
    peak_hours = [{"hour": h, "count": peak_hours_map[h]} for h in range(24)]
    
    total_bookings_in_period = len(active_bookings)
    summary = {
        "total_revenue": round(total_revenue, 2),
        "total_bookings": total_bookings_in_period,
        "confirmed_count": confirmed_count,
        "cancelled_count": cancelled_count,
        "avg_booking_value": round(total_revenue / confirmed_count, 2) if confirmed_count > 0 else 0,
        "cancellation_rate": round((cancelled_count / total_bookings_in_period) * 100, 2) if total_bookings_in_period > 0 else 0
    }
    
    return {
        "revenue_by_day": revenue_by_day,
        "revenue_by_ground": revenue_by_ground,
        "bookings_by_sport": bookings_by_sport,
        "peak_hours": peak_hours,
        "summary": summary
    }
