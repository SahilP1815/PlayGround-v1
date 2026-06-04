from fastapi import APIRouter, Depends, HTTPException, status
from app.models.ground import Ground, Court, TimeSlot, VerificationDocs, GroundStatus
from app.models.booking import Booking, BookingStatus
from app.models.user import User
from app.schemas.ground import GroundCreate, GroundResponse, GroundUpdate
from app.api.deps import get_current_user, get_current_active_owner, get_current_active_admin
from typing import List, Any, Optional
from datetime import datetime
import re
from beanie.operators import Or

router = APIRouter()

@router.post("/", response_model=GroundResponse)
@router.post("", response_model=GroundResponse)
async def create_ground(
    ground_in: GroundCreate,
    current_owner: User = Depends(get_current_active_owner)
) -> Any:
    # Convert CourtCreate schemas to Court models
    courts = [
        Court(
            name=c.name,
            sport_type=c.sport_type,
            base_price=c.base_price,
            surface_type=c.surface_type,
            ground_size=c.ground_size,
            max_players=c.max_players,
            is_indoor=c.is_indoor
        )
        for c in ground_in.courts
    ]
    
    # Convert TimeSlotBase schemas to TimeSlot models
    time_slots = [
        TimeSlot(**slot.model_dump())
        for slot in ground_in.time_slots
    ]
    
    new_ground = Ground(
        owner_id=str(current_owner.id),
        name=ground_in.name,
        description=ground_in.description,
        location=ground_in.location.model_dump(),
        surface_type=ground_in.surface_type,
        ground_size=ground_in.ground_size,
        max_players=ground_in.max_players,
        is_indoor=ground_in.is_indoor,
        images=ground_in.images,
        video_url=ground_in.video_url,
        amenities=ground_in.amenities,
        courts=courts,
        time_slots=time_slots,
        advance_booking_days=ground_in.advance_booking_days,
        cancellation_policy=ground_in.cancellation_policy,
        min_booking_duration=ground_in.min_booking_duration,
        security_deposit=ground_in.security_deposit,
        verification_docs=VerificationDocs(**ground_in.verification_docs.model_dump()) if ground_in.verification_docs else None,
        status=GroundStatus.PENDING
    )
    await new_ground.insert()
    return new_ground

@router.post("/{ground_id}/submit-for-review", response_model=GroundResponse)
async def submit_for_review(
    ground_id: str,
    current_owner: User = Depends(get_current_active_owner)
) -> Any:
    ground = await Ground.get(ground_id)
    if not ground:
        raise HTTPException(status_code=404, detail="Ground not found")
    
    if ground.owner_id != str(current_owner.id):
        raise HTTPException(status_code=403, detail="Not authorized to submit this ground")
    
    if ground.status != GroundStatus.DRAFT:
        raise HTTPException(status_code=400, detail=f"Ground must be in DRAFT status to submit (current: {ground.status})")
    
    if not ground.verification_docs or not ground.verification_docs.property_proof:
         raise HTTPException(status_code=400, detail="Property proof is required for verification submission")

    ground.status = GroundStatus.PENDING
    ground.updated_at = datetime.utcnow()
    await ground.save()
    return ground

@router.get("/{ground_id}/status")
async def get_ground_status(
    ground_id: str,
    current_owner: User = Depends(get_current_active_owner)
) -> Any:
    ground = await Ground.get(ground_id)
    if not ground:
        raise HTTPException(status_code=404, detail="Ground not found")
    
    if ground.owner_id != str(current_owner.id):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return {
        "status": ground.status,
        "rejection_reason": getattr(ground, "rejection_reason", None)
    }

@router.get("/my", response_model=List[GroundResponse])
async def list_my_grounds(
    current_owner: User = Depends(get_current_active_owner)
) -> Any:
    grounds = await Ground.find(Ground.owner_id == str(current_owner.id)).to_list()
    return grounds

@router.get("/dashboard-info")
async def get_dashboard_info(
    current_owner: User = Depends(get_current_active_owner)
) -> Any:
    grounds = await Ground.find(Ground.owner_id == str(current_owner.id)).to_list()
    
    from app.models.handler import Handler
    handlers = await Handler.find(Handler.owner_id == str(current_owner.id)).to_list()
    handler_map = {str(h.id): h for h in handlers}
    
    enriched_grounds = []
    for g in grounds:
        g_dict = g.model_dump()
        g_dict["id"] = str(g.id)
        if g.assigned_handler_id and g.assigned_handler_id in handler_map:
            handler = handler_map[g.assigned_handler_id]
            g_dict["handler_info"] = {
                "id": str(handler.id),
                "name": handler.name,
                "email": handler.email,
                "role": handler.role
            }
        else:
            g_dict["handler_info"] = None
        enriched_grounds.append(g_dict)
        
    return {
        "grounds": enriched_grounds,
        "handlers": [{"id": str(h.id), "name": h.name, "email": h.email, "role": h.role, "is_active": h.is_active} for h in handlers]
    }

@router.get("/favorites/me", response_model=List[GroundResponse])
async def list_favorite_grounds(
    current_user: User = Depends(get_current_user)
) -> Any:
    if not current_user.favorites:
        return []
    
    grounds = []
    for ground_id in current_user.favorites:
        ground = await Ground.get(ground_id)
        if ground:
            grounds.append(ground)
            
    return grounds

@router.get("/", response_model=List[GroundResponse])
@router.get("", response_model=List[GroundResponse])
async def list_grounds(
    sport: Optional[str] = None,
    city: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    amenities: Optional[str] = None,
    is_indoor: Optional[bool] = None,
    date: Optional[str] = None,
    sort_by: Optional[str] = "newest"
) -> Any:
    # 1. Base query conditions
    conditions = [Ground.status == GroundStatus.VERIFIED]
    
    # 2. Add filters
    if city:
        conditions.append(Ground.location.city == re.compile(f"^{city}$", re.IGNORECASE))
        
    if search:
        conditions.append(Or(
            Ground.name == re.compile(search, re.IGNORECASE),
            Ground.description == re.compile(search, re.IGNORECASE),
            Ground.location.address == re.compile(search, re.IGNORECASE),
            Ground.location.city == re.compile(search, re.IGNORECASE)
        ))
        
    if is_indoor is not None:
        conditions.append(Ground.is_indoor == is_indoor)
        
    if amenities:
        amenity_list = [a.strip() for a in amenities.split(",")]
        conditions.append(Ground.amenities.all(amenity_list))

    # Fetch initial set
    grounds = await Ground.find(*conditions).to_list()
    
    # 3. Post-fetch filtering and enrichment
    filtered_grounds = []
    for g in grounds:
        courts = g.courts
        
        # Enrichment
        g_min_price = min((c.base_price for c in courts), default=0)
        g_sports = list(set(c.sport_type for c in courts))
        
        # Filter by sport
        if sport and sport not in g_sports:
            continue
            
        # Filter by price range
        if min_price is not None and g_min_price < min_price:
            continue
        if max_price is not None and g_min_price > max_price:
            continue
            
        # 4. Date filter (Heuristic availability check)
        if date:
            try:
                dt = datetime.strptime(date, '%Y-%m-%d')
                day_start = dt.replace(hour=0, minute=0, second=0)
                day_end = dt.replace(hour=23, minute=59, second=59)
                
                bookings = await Booking.find(
                    Booking.ground_id == str(g.id),
                    Booking.start_time >= day_start,
                    Booking.start_time <= day_end,
                    Booking.status == BookingStatus.CONFIRMED
                ).to_list()
                
                has_availability = False
                for court in courts:
                    court_bookings = [b for b in bookings if str(b.court_id) == str(court.id)]
                    booked_hours = sum((b.end_time - b.start_time).total_seconds() / 3600 for b in court_bookings)
                    if booked_hours < 16:
                        has_availability = True
                        break
                
                if not has_availability:
                    continue
            except Exception:
                pass
            
        g.min_price = g_min_price
        g.sports = g_sports
        filtered_grounds.append(g)

    # 5. Sorting
    if sort_by == "price_asc":
        filtered_grounds.sort(key=lambda x: x.min_price)
    elif sort_by == "price_desc":
        filtered_grounds.sort(key=lambda x: x.min_price, reverse=True)
    elif sort_by == "rating":
        filtered_grounds.sort(key=lambda x: x.avg_rating or 0, reverse=True)
    else:
        filtered_grounds.sort(key=lambda x: getattr(x, 'created_at', str(x.id)), reverse=True)
        
    return filtered_grounds

@router.get("/all", response_model=List[GroundResponse])
async def list_all_grounds(
    admin: User = Depends(get_current_active_admin)
) -> Any:
    grounds = await Ground.find_all().to_list()
    return grounds

@router.get("/{ground_id}", response_model=GroundResponse)
async def get_ground(ground_id: str) -> Any:
    ground = await Ground.get(ground_id)
    if not ground:
        raise HTTPException(status_code=404, detail="Ground not found")
    return ground

@router.put("/{ground_id}", response_model=GroundResponse)
async def update_ground(
    ground_id: str,
    ground_in: GroundUpdate,
    current_user: User = Depends(get_current_user)
) -> Any:
    ground = await Ground.get(ground_id)
    if not ground:
        raise HTTPException(status_code=404, detail="Ground not found")
    
    is_owner = current_user.role in ["owner", "admin"]
    is_handler = getattr(current_user, "is_handler", False)
    
    if is_owner:
        if current_user.role == "owner" and ground.owner_id != str(current_user.id):
            raise HTTPException(status_code=403, detail="Not authorized to update this ground")
    elif is_handler:
        from app.models.handler import Handler
        handler = await Handler.find_one(Handler.user_id == str(current_user.id))
        if not handler or not handler.is_active:
            raise HTTPException(status_code=403, detail="Handler is not active or unauthorized")
        if ground_id not in handler.assigned_venues:
            raise HTTPException(status_code=403, detail="Handler is not assigned to this venue")
            
        update_data_raw = ground_in.model_dump(exclude_unset=True)
        
        # Check basic details
        basic_fields = ["name", "description", "location", "images", "amenities", "cancellation_policy", "video_url"]
        has_basic_updates = any(f in update_data_raw for f in basic_fields)
        if has_basic_updates and not handler.can_edit_venue_details:
            raise HTTPException(status_code=403, detail="Permission denied: cannot edit venue details")
            
        # Check court updates
        if "courts" in update_data_raw:
            if not handler.can_manage_pricing:
                existing_prices = {c.name: c.base_price for c in ground.courts}
                for c in update_data_raw["courts"]:
                    name = c.get("name")
                    price = c.get("base_price")
                    if name in existing_prices and existing_prices[name] != price:
                        raise HTTPException(status_code=403, detail="Permission denied: cannot manage pricing")
            if not handler.can_edit_venue_details:
                existing_court_names = {c.name for c in ground.courts}
                incoming_court_names = {c.get("name") for c in update_data_raw["courts"]}
                if existing_court_names != incoming_court_names:
                    raise HTTPException(status_code=403, detail="Permission denied: cannot edit court details")
                    
        # Check slot updates
        if "time_slots" in update_data_raw:
            if not handler.can_add_time_slots and not handler.can_manage_pricing:
                raise HTTPException(status_code=403, detail="Permission denied: cannot manage slots or pricing")
            
            if handler.can_manage_pricing and not handler.can_add_time_slots:
                if len(ground.time_slots) != len(update_data_raw["time_slots"]):
                    raise HTTPException(status_code=403, detail="Permission denied: cannot add/remove time slots")
            if handler.can_add_time_slots and not handler.can_manage_pricing:
                existing_slot_prices = {
                    (tuple(sorted(s.days)), s.start_time, s.end_time): s.price_per_hour
                    for s in ground.time_slots
                }
                for s in update_data_raw["time_slots"]:
                    days_key = tuple(sorted(s.get("days", [])))
                    start = s.get("start_time")
                    end = s.get("end_time")
                    price = s.get("price_per_hour")
                    key = (days_key, start, end)
                    if key in existing_slot_prices and existing_slot_prices[key] != price:
                        raise HTTPException(status_code=403, detail="Permission denied: cannot manage pricing")
    else:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    update_data = ground_in.model_dump(exclude_unset=True)
    
    if "courts" in update_data and update_data["courts"] is not None:
        update_data["courts"] = [
            Court(
                name=c["name"],
                sport_type=c["sport_type"],
                base_price=c["base_price"],
                surface_type=c.get("surface_type"),
                ground_size=c.get("ground_size"),
                max_players=c.get("max_players"),
                is_indoor=c.get("is_indoor", False)
            )
            for c in update_data["courts"]
        ]
        
    if "time_slots" in update_data and update_data["time_slots"] is not None:
        update_data["time_slots"] = [
            TimeSlot(**slot)
            for slot in update_data["time_slots"]
        ]
        
    if "verification_docs" in update_data and update_data["verification_docs"] is not None:
        update_data["verification_docs"] = VerificationDocs(**update_data["verification_docs"])
    
    for field, value in update_data.items():
        setattr(ground, field, value)
    
    ground.updated_at = datetime.utcnow()
    await ground.save()
    return ground

@router.delete("/{ground_id}")
async def delete_ground(
    ground_id: str,
    current_owner: User = Depends(get_current_active_owner)
) -> Any:
    ground = await Ground.get(ground_id)
    if not ground:
        raise HTTPException(status_code=404, detail="Ground not found")
    
    if ground.owner_id != str(current_owner.id):
        raise HTTPException(status_code=403, detail="Not authorized to delete this ground")
    
    await ground.delete()
    return {"message": "Ground deleted successfully"}
