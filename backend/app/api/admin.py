from fastapi import APIRouter, Depends, HTTPException
from app.models.user import User, UserRole
from app.models.ground import Ground, GroundStatus
from app.schemas.user import UserResponse
from app.schemas.ground import GroundResponse
from app.api.deps import get_current_active_admin
from typing import List, Any, Optional
from pydantic import BaseModel
from datetime import datetime
from beanie.operators import Or

router = APIRouter()

class RejectionBody(BaseModel):
    reason: Optional[str] = None

@router.get("/users", response_model=List[UserResponse])
async def list_users(
    admin: User = Depends(get_current_active_admin)
) -> Any:
    users = await User.find(User.role == UserRole.USER).to_list()
    return [
        UserResponse(
            id=str(u.id),
            name=u.name,
            email=str(u.email),
            role=u.role,
            phone=u.phone,
            bio=u.bio,
            avatar_color=u.avatar_color,
            created_at=u.created_at
        ) for u in users
    ]

@router.get("/owners", response_model=List[UserResponse])
async def list_owners(
    admin: User = Depends(get_current_active_admin)
) -> Any:
    owners = await User.find(User.role == UserRole.OWNER).to_list()
    return [
        UserResponse(
            id=str(o.id),
            name=o.name,
            email=str(o.email),
            role=o.role,
            phone=o.phone,
            bio=o.bio,
            avatar_color=o.avatar_color,
            created_at=o.created_at
        ) for o in owners
    ]

@router.get("/stats")
async def get_stats(
    admin: User = Depends(get_current_active_admin)
) -> Any:
    try:
        total_users = await User.find(User.role == UserRole.USER).count()
        total_owners = await User.find(User.role == UserRole.OWNER).count()
        total_grounds = await Ground.find_all().count()
        verified_grounds = await Ground.find(Ground.status == GroundStatus.VERIFIED).count()
        pending_grounds = await Ground.find(
            Or(Ground.status == GroundStatus.PENDING, Ground.status == GroundStatus.DRAFT)
        ).count()
        
        from app.models.dispute import Dispute
        disputes_open = await Dispute.find(Dispute.status == "open").count()
        return {
            "total_users": total_users,
            "total_owners": total_owners,
            "total_grounds": total_grounds,
            "verified_grounds": verified_grounds,
            "pending_grounds": pending_grounds,
            "disputes_open": disputes_open,
            "revenue": 120000 # Mock for now
        }
    except Exception as e:
        print(f"Error in get_stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/grounds/pending")
async def list_pending_grounds(
    admin: User = Depends(get_current_active_admin)
) -> Any:
    grounds = await Ground.find(
        Or(Ground.status == GroundStatus.PENDING, Ground.status == GroundStatus.DRAFT)
    ).to_list()
    enriched = []
    for g in grounds:
        owner = await User.get(g.owner_id)
        enriched.append({
            **g.model_dump(),
            "id": str(g.id),
            "owner_name": owner.name if owner else "Unknown",
            "owner_email": owner.email if owner else "Unknown",
        })
    return enriched

@router.get("/grounds/verified")
async def list_verified_grounds(
    admin: User = Depends(get_current_active_admin)
) -> Any:
    return await Ground.find(Ground.status == GroundStatus.VERIFIED).to_list()

@router.patch("/grounds/{ground_id}/verify")
async def verify_ground(
    ground_id: str,
    admin: User = Depends(get_current_active_admin)
) -> Any:
    ground = await Ground.get(ground_id)
    if not ground:
        raise HTTPException(status_code=404, detail="Ground not found")
    
    ground.status = GroundStatus.VERIFIED
    await ground.save()
    return {"message": "Ground verified successfully"}

@router.patch("/grounds/{ground_id}/reject")
async def reject_ground(
    ground_id: str,
    body: RejectionBody,
    admin: User = Depends(get_current_active_admin)
) -> Any:
    ground = await Ground.get(ground_id)
    if not ground:
        raise HTTPException(status_code=404, detail="Ground not found")
    
    ground.status = GroundStatus.REJECTED
    # In a real app, you'd save the reason too
    await ground.save()
    return {"message": "Ground rejected successfully"}

@router.get("/bookings")
async def list_global_bookings(
    admin: User = Depends(get_current_active_admin)
) -> Any:
    from app.models.booking import Booking
    bookings = await Booking.find_all().to_list()
    
    enriched = []
    for b in bookings:
        ground = await Ground.get(b.ground_id)
        user = await User.get(b.user_id)
        enriched.append({
            **b.model_dump(),
            "id": str(b.id),
            "ground_name": ground.name if ground else "Unknown",
            "user_name": user.name if user else "Unknown",
            "user_email": user.email if user else "Unknown"
        })
    return enriched

class DisputeResolutionBody(BaseModel):
    resolution: str
    admin_notes: Optional[str] = None

@router.get("/disputes")
async def list_global_disputes(
    admin: User = Depends(get_current_active_admin)
) -> Any:
    from app.models.dispute import Dispute
    from app.models.ground import Ground
    from app.models.booking import Booking
    
    disputes = await Dispute.find_all().to_list()
    enriched = []
    for d in disputes:
        player = await User.get(d.user_id)
        booking = await Booking.get(d.booking_id)
        ground = await Ground.get(d.ground_id)
        
        owner_name = "Unknown"
        owner_email = "Unknown"
        if ground:
            owner = await User.get(ground.owner_id)
            if owner:
                owner_name = owner.name
                owner_email = owner.email

        enriched.append({
            "id": str(d.id),
            "booking_id": d.booking_id,
            "human_booking_id": booking.booking_id if booking else "N/A",
            "sport_type": booking.court_id.split("-")[0] if booking else "Unknown",
            "user_id": d.user_id,
            "player_name": player.name if player else "Unknown Player",
            "player_email": player.email if player else "No Email",
            "ground_id": d.ground_id,
            "ground_name": ground.name if ground else "Unknown Ground",
            "owner_name": owner_name,
            "owner_email": owner_email,
            "reason_category": d.reason_category,
            "description": d.description,
            "status": d.status,
            "resolution": d.resolution,
            "admin_notes": d.admin_notes,
            "created_at": d.created_at.isoformat() if isinstance(d.created_at, datetime) else d.created_at
        })
    return enriched

@router.post("/disputes/{dispute_id}/resolve")
async def resolve_dispute(
    dispute_id: str,
    body: DisputeResolutionBody,
    admin: User = Depends(get_current_active_admin)
) -> Any:
    from app.models.dispute import Dispute
    from app.models.booking import Booking, BookingStatus
    
    dispute = await Dispute.get(dispute_id)
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")
        
    if body.resolution not in ["refunded", "released"]:
        raise HTTPException(status_code=400, detail="Resolution must be either refunded or released")
        
    dispute.status = "resolved"
    dispute.resolution = body.resolution
    dispute.admin_notes = body.admin_notes
    await dispute.save()
    
    if body.resolution == "refunded":
        booking = await Booking.get(dispute.booking_id)
        if booking:
            booking.status = BookingStatus.CANCELLED
            booking.cancellation_reason = f"Dispute resolved by Admin: {body.admin_notes or 'Refund approved'}"
            booking.cancelled_by = "admin"
            await booking.save()
            
    return {"message": "Dispute resolved successfully", "dispute": dispute}
