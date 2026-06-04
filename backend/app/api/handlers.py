from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any
from datetime import datetime, timedelta
from collections import defaultdict
from beanie.operators import In
from bson import ObjectId

from app.models.user import User, UserRole
from app.models.handler import Handler, HandlerRole
from app.models.ground import Ground
from app.models.booking import Booking, BookingStatus
from app.api.deps import get_current_user, get_current_active_owner
from app.core.security import get_password_hash

router = APIRouter()

class HandlerCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: HandlerRole = HandlerRole.MANAGER
    password: str
    assigned_venues: Optional[List[str]] = []

class HandlerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[HandlerRole] = None
    is_active: Optional[bool] = None
    can_confirm_bookings: Optional[bool] = None
    can_cancel_bookings: Optional[bool] = None
    can_view_analytics: Optional[bool] = None
    can_edit_venue_details: Optional[bool] = None
    can_add_time_slots: Optional[bool] = None
    can_manage_pricing: Optional[bool] = None

class VenueAssign(BaseModel):
    ground_id: str

# ----------------- OWNER CRUD ENDPOINTS FOR HANDLERS -----------------

@router.post("/api/handlers", response_model=dict)
async def create_handler(
    handler_in: HandlerCreate,
    current_owner: User = Depends(get_current_active_owner)
):
    # Check if user already exists
    existing_user = await User.find_one(User.email == handler_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    # 1. Create User
    hashed_password = get_password_hash(handler_in.password)
    user = User(
        name=handler_in.name,
        email=handler_in.email,
        hashed_password=hashed_password,
        role=UserRole.HANDLER,
        phone=handler_in.phone,
        is_handler=True,
        handler_for_owner_id=str(current_owner.id)
    )
    await user.insert()

    # 2. Create Handler record
    handler = Handler(
        user_id=str(user.id),
        owner_id=str(current_owner.id),
        name=handler_in.name,
        email=handler_in.email,
        phone=handler_in.phone,
        assigned_venues=handler_in.assigned_venues,
        role=handler_in.role
    )
    await handler.insert()

    # 3. Update ground models to reference this handler
    for ground_id in handler_in.assigned_venues:
        ground = await Ground.get(ground_id)
        if ground and ground.owner_id == str(current_owner.id):
            ground.assigned_handler_id = str(handler.id)
            await ground.save()

    return {
        "message": "Handler created successfully",
        "handler_id": str(handler.id),
        "user_id": str(user.id)
    }

@router.get("/api/handlers", response_model=List[dict])
async def list_handlers(
    current_owner: User = Depends(get_current_active_owner)
):
    handlers = await Handler.find(Handler.owner_id == str(current_owner.id)).to_list()
    result = []
    for h in handlers:
        result.append({
            "id": str(h.id),
            "user_id": h.user_id,
            "name": h.name,
            "email": h.email,
            "phone": h.phone,
            "assigned_venues": h.assigned_venues,
            "role": h.role,
            "is_active": h.is_active,
            "can_confirm_bookings": h.can_confirm_bookings,
            "can_cancel_bookings": h.can_cancel_bookings,
            "can_view_analytics": h.can_view_analytics,
            "can_edit_venue_details": h.can_edit_venue_details,
            "can_add_time_slots": h.can_add_time_slots,
            "can_manage_pricing": h.can_manage_pricing,
            "assigned_at": h.assigned_at.isoformat() if h.assigned_at else None
        })
    return result

@router.get("/api/handlers/{handler_id}", response_model=dict)
async def get_handler(
    handler_id: str,
    current_owner: User = Depends(get_current_active_owner)
):
    handler = await Handler.get(handler_id)
    if not handler or handler.owner_id != str(current_owner.id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Handler not found or unauthorized"
        )
    return {
        "id": str(handler.id),
        "user_id": handler.user_id,
        "name": handler.name,
        "email": handler.email,
        "phone": handler.phone,
        "assigned_venues": handler.assigned_venues,
        "role": handler.role,
        "is_active": handler.is_active,
        "can_confirm_bookings": handler.can_confirm_bookings,
        "can_cancel_bookings": handler.can_cancel_bookings,
        "can_view_analytics": handler.can_view_analytics,
        "can_edit_venue_details": handler.can_edit_venue_details,
        "can_add_time_slots": handler.can_add_time_slots,
        "can_manage_pricing": handler.can_manage_pricing
    }

@router.put("/api/handlers/{handler_id}", response_model=dict)
async def update_handler(
    handler_id: str,
    handler_in: HandlerUpdate,
    current_owner: User = Depends(get_current_active_owner)
):
    handler = await Handler.get(handler_id)
    if not handler or handler.owner_id != str(current_owner.id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Handler not found or unauthorized"
        )

    # Update User too if name/phone/is_active changes
    user = await User.get(handler.user_id)

    update_data = handler_in.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(handler, k, v)
        if user and k in ["name", "phone"]:
            setattr(user, k, v)

    if "is_active" in update_data:
        handler.is_active = update_data["is_active"]
        if not handler.is_active:
            handler.revoked_at = datetime.utcnow()
        else:
            handler.revoked_at = None

    await handler.save()
    if user:
        await user.save()

    return {"message": "Handler updated successfully", "handler_id": str(handler.id)}

@router.delete("/api/handlers/{handler_id}", response_model=dict)
async def revoke_handler(
    handler_id: str,
    current_owner: User = Depends(get_current_active_owner)
):
    handler = await Handler.get(handler_id)
    if not handler or handler.owner_id != str(current_owner.id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Handler not found or unauthorized"
        )

    # 1. Update ground assignments
    for ground_id in handler.assigned_venues:
        ground = await Ground.get(ground_id)
        if ground and ground.assigned_handler_id == str(handler.id):
            ground.assigned_handler_id = None
            await ground.save()

    # 2. Update User (deactivate or remove is_handler flag)
    user = await User.get(handler.user_id)
    if user:
        user.is_handler = False
        user.role = UserRole.USER
        await user.save()

    # 3. Delete Handler
    await handler.delete()

    return {"message": "Handler access revoked successfully"}

@router.post("/api/handlers/{handler_id}/assign-venue", response_model=dict)
async def assign_venue(
    handler_id: str,
    assign_in: VenueAssign,
    current_owner: User = Depends(get_current_active_owner)
):
    handler = await Handler.get(handler_id)
    if not handler or handler.owner_id != str(current_owner.id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Handler not found or unauthorized"
        )

    ground = await Ground.get(assign_in.ground_id)
    if not ground or ground.owner_id != str(current_owner.id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ground not found or unauthorized"
        )

    if assign_in.ground_id not in handler.assigned_venues:
        handler.assigned_venues.append(assign_in.ground_id)
        await handler.save()

    ground.assigned_handler_id = str(handler.id)
    await ground.save()

    return {"message": "Venue assigned successfully"}

@router.delete("/api/handlers/{handler_id}/revoke-venue", response_model=dict)
async def revoke_venue(
    handler_id: str,
    revoke_in: VenueAssign,
    current_owner: User = Depends(get_current_active_owner)
):
    handler = await Handler.get(handler_id)
    if not handler or handler.owner_id != str(current_owner.id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Handler not found or unauthorized"
        )

    ground = await Ground.get(revoke_in.ground_id)
    if not ground or ground.owner_id != str(current_owner.id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ground not found or unauthorized"
        )

    if revoke_in.ground_id in handler.assigned_venues:
        handler.assigned_venues.remove(revoke_in.ground_id)
        await handler.save()

    if ground.assigned_handler_id == str(handler.id):
        ground.assigned_handler_id = None
        await ground.save()

    return {"message": "Venue revoked successfully"}

# ----------------- ANALYTICS HELPER -----------------

def calculate_analytics_for_bookings(bookings: List[Booking], grounds: List[Ground], days: int):
    now = datetime.utcnow()
    start_filter = now - timedelta(days=days)
    
    ground_map = {str(g.id): g for g in grounds}
    
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

    revenue_by_day = [{"date": d, "revenue": revenue_by_day_map[d]} for d in last_n_days]
    revenue_by_ground = [{"ground_name": name, "revenue": rev} for name, rev in revenue_by_ground_map.items()]
    bookings_by_sport = [{"sport_type": sport, "count": count} for sport, count in bookings_by_sport_map.items()]
    peak_hours = [{"hour": h, "count": peak_hours_map[h]} for h in range(24)]
    
    total_bookings_in_period = len(active_bookings)
    
    return {
        "revenue_by_day": revenue_by_day,
        "revenue_by_ground": revenue_by_ground,
        "bookings_by_sport": bookings_by_sport,
        "peak_hours": peak_hours,
        "summary": {
            "total_revenue": round(total_revenue, 2),
            "total_bookings": total_bookings_in_period,
            "confirmed_count": confirmed_count,
            "cancelled_count": cancelled_count,
            "avg_booking_value": round(total_revenue / confirmed_count, 2) if confirmed_count > 0 else 0,
            "cancellation_rate": round((cancelled_count / total_bookings_in_period) * 100, 2) if total_bookings_in_period > 0 else 0
        }
    }

# ----------------- OWNER DASHBOARD ENDPOINTS -----------------

@router.get("/api/owner/dashboard", response_model=dict)
async def get_owner_dashboard(
    current_owner: User = Depends(get_current_active_owner)
):
    grounds = await Ground.find(Ground.owner_id == str(current_owner.id)).to_list()
    ground_ids = [str(g.id) for g in grounds]
    
    bookings = await Booking.find(In(Booking.ground_id, ground_ids)).to_list()
    handlers = await Handler.find(Handler.owner_id == str(current_owner.id)).to_list()
    
    return {
        "venues_count": len(grounds),
        "handlers_count": len(handlers),
        "bookings_count": len(bookings),
        "total_revenue": sum(b.total_price for b in bookings if b.status == BookingStatus.CONFIRMED)
    }

@router.get("/api/owner/dashboard/analytics", response_model=dict)
async def get_owner_dashboard_analytics(
    days: int = 30,
    current_owner: User = Depends(get_current_active_owner)
):
    grounds = await Ground.find(Ground.owner_id == str(current_owner.id)).to_list()
    ground_ids = [str(g.id) for g in grounds]
    bookings = await Booking.find(In(Booking.ground_id, ground_ids)).to_list()
    
    return calculate_analytics_for_bookings(bookings, grounds, days)

# ----------------- HANDLER DASHBOARD ENDPOINTS -----------------

@router.get("/api/handler/dashboard/{handler_id}", response_model=dict)
async def get_handler_dashboard(
    handler_id: str,
    current_user: User = Depends(get_current_user)
):
    if handler_id == "me":
        handler = await Handler.find_one(Handler.user_id == str(current_user.id))
    else:
        handler = await Handler.get(handler_id)
        
    if not handler:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Handler not found"
        )
        
    # Security check: User is either the handler themselves OR the owner of the handler
    is_self = str(current_user.id) == handler.user_id
    is_owner = str(current_user.id) == handler.owner_id
    
    if not (is_self or is_owner):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized access to this handler's dashboard"
        )
        
    if is_self and not handler.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your handler access has been revoked."
        )
        
    grounds = await Ground.find(In(Ground.id, [ObjectId(vid) for vid in handler.assigned_venues])).to_list()
    bookings = await Booking.find(In(Booking.ground_id, handler.assigned_venues)).to_list()
    
    # Enrich bookings
    enriched_bookings = []
    for b in bookings:
        ground = next((g for g in grounds if str(g.id) == b.ground_id), None)
        court_name = "Unknown Court"
        sport_type = "Sports"
        if ground:
            for c in ground.courts:
                if str(c.id) == b.court_id:
                    court_name = c.name
                    sport_type = c.sport_type
                    break
        customer = await User.get(b.user_id)
        
        enriched_bookings.append({
            "id": str(b.id),
            "booking_id": b.booking_id,
            "ground_id": b.ground_id,
            "ground_name": ground.name if ground else "Unknown Ground",
            "court_name": court_name,
            "sport_type": sport_type,
            "customer_name": customer.name if customer else "Unknown Player",
            "customer_email": customer.email if customer else "N/A",
            "start_time": b.start_time.isoformat() + "Z" if b.start_time else None,
            "end_time": b.end_time.isoformat() + "Z" if b.end_time else None,
            "total_price": b.total_price,
            "status": b.status
        })

    analytics = calculate_analytics_for_bookings(bookings, grounds, 30)
    
    if not handler.can_view_analytics:
        analytics = {
            "revenue_by_day": [],
            "revenue_by_ground": [],
            "bookings_by_sport": analytics.get("bookings_by_sport", []),
            "peak_hours": analytics.get("peak_hours", []),
            "summary": {
                **analytics.get("summary", {}),
                "total_revenue": 0.0,
                "avg_booking_value": 0.0
            }
        }

    return {
        "handler": {
            "id": str(handler.id),
            "name": handler.name,
            "email": handler.email,
            "assigned_venues": handler.assigned_venues,
            "role": handler.role,
            "can_confirm_bookings": handler.can_confirm_bookings,
            "can_cancel_bookings": handler.can_cancel_bookings,
            "can_view_analytics": handler.can_view_analytics,
            "can_manage_pricing": handler.can_manage_pricing,
            "can_add_time_slots": handler.can_add_time_slots,
            "can_edit_venue_details": handler.can_edit_venue_details
        },
        "venues": [
            {
                "id": str(g.id),
                "name": g.name,
                "status": g.status,
                "location": g.location,
                "courts": [
                    {
                        "id": str(c.id),
                        "name": c.name,
                        "sport_type": c.sport_type,
                        "base_price": c.base_price,
                        "surface_type": c.surface_type,
                        "max_players": c.max_players,
                        "is_indoor": c.is_indoor
                    }
                    for c in g.courts
                ],
                "images": g.images,
                "bookings_count": len([b for b in bookings if b.ground_id == str(g.id)])
            }
            for g in grounds
        ],
        "bookings": enriched_bookings,
        "total_bookings": len(bookings),
        "analytics": analytics
    }

@router.get("/api/handler/dashboard/{handler_id}/analytics", response_model=dict)
async def get_handler_analytics(
    handler_id: str,
    days: int = 30,
    current_user: User = Depends(get_current_user)
):
    if handler_id == "me":
        handler = await Handler.find_one(Handler.user_id == str(current_user.id))
    else:
        handler = await Handler.get(handler_id)
        
    if not handler:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Handler not found"
        )
        
    is_self = str(current_user.id) == handler.user_id
    is_owner = str(current_user.id) == handler.owner_id
    
    if not (is_self or is_owner):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized"
        )
        
    if is_self and not handler.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your handler access has been revoked."
        )
        
    if not handler.can_view_analytics:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view analytics"
        )
        
    grounds = await Ground.find(In(Ground.id, [ObjectId(vid) for vid in handler.assigned_venues])).to_list()
    bookings = await Booking.find(In(Booking.ground_id, handler.assigned_venues)).to_list()
    
    return calculate_analytics_for_bookings(bookings, grounds, days)

@router.get("/api/handler/bookings/{handler_id}", response_model=List[dict])
async def get_handler_bookings(
    handler_id: str,
    current_user: User = Depends(get_current_user)
):
    if handler_id == "me":
        handler = await Handler.find_one(Handler.user_id == str(current_user.id))
    else:
        handler = await Handler.get(handler_id)
        
    if not handler:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Handler not found"
        )
        
    is_self = str(current_user.id) == handler.user_id
    is_owner = str(current_user.id) == handler.owner_id
    
    if not (is_self or is_owner):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized"
        )
        
    if is_self and not handler.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your handler access has been revoked."
        )
        
    grounds = await Ground.find(In(Ground.id, [ObjectId(vid) for vid in handler.assigned_venues])).to_list()
    bookings = await Booking.find(In(Booking.ground_id, handler.assigned_venues)).to_list()
    
    enriched_bookings = []
    for b in bookings:
        ground = next((g for g in grounds if str(g.id) == b.ground_id), None)
        court_name = "Unknown Court"
        sport_type = "Sports"
        if ground:
            for c in ground.courts:
                if str(c.id) == b.court_id:
                    court_name = c.name
                    sport_type = c.sport_type
                    break
        customer = await User.get(b.user_id)
        
        enriched_bookings.append({
            "id": str(b.id),
            "booking_id": b.booking_id,
            "ground_id": b.ground_id,
            "ground_name": ground.name if ground else "Unknown Ground",
            "court_name": court_name,
            "sport_type": sport_type,
            "customer_name": customer.name if customer else "Unknown Player",
            "customer_email": customer.email if customer else "N/A",
            "start_time": b.start_time.isoformat() + "Z" if b.start_time else None,
            "end_time": b.end_time.isoformat() + "Z" if b.end_time else None,
            "total_price": b.total_price,
            "status": b.status
        })
        
    return enriched_bookings
