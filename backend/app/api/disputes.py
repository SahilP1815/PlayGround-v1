from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_user
from app.models.user import User
from app.models.booking import Booking
from app.models.dispute import Dispute
from pydantic import BaseModel
from typing import List, Any
from datetime import datetime

router = APIRouter()

class DisputeRaiseBody(BaseModel):
    booking_id: str
    reason_category: str
    description: str

@router.post("/raise")
async def raise_dispute(
    body: DisputeRaiseBody,
    current_user: User = Depends(get_current_user)
) -> Any:
    # 1. Fetch booking
    booking = await Booking.get(body.booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # 2. Check ownership
    if str(booking.user_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to raise a dispute for this booking"
        )
    
    # 3. Check duplicate dispute
    existing = await Dispute.find_one(Dispute.booking_id == body.booking_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A dispute has already been raised for this booking"
        )
    
    # 4. Create Dispute
    dispute = Dispute(
        booking_id=body.booking_id,
        user_id=str(current_user.id),
        ground_id=booking.ground_id,
        reason_category=body.reason_category,
        description=body.description,
        status="open"
    )
    await dispute.insert()
    return {"message": "Dispute raised successfully", "dispute_id": str(dispute.id)}

@router.get("/my")
async def my_disputes(
    current_user: User = Depends(get_current_user)
) -> Any:
    disputes = await Dispute.find(Dispute.user_id == str(current_user.id)).to_list()
    return disputes
