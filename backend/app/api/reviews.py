from fastapi import APIRouter, Depends, HTTPException, status
from app.models.review import Review
from app.models.ground import Ground
from app.models.booking import Booking
from app.models.user import User
from app.api.deps import get_current_user, get_current_active_admin
from typing import List, Any, Optional
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class ReviewCreate(BaseModel):
    ground_id: str
    booking_id: str
    rating: int
    comment: str

@router.post("/")
async def create_review(
    review_in: ReviewCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    # 1. Validate booking
    # Try finding by human ID first, then Mongo ID
    booking = await Booking.find_one(Booking.booking_id == review_in.booking_id)
    if not booking:
        try:
            booking = await Booking.get(review_in.booking_id)
        except:
            booking = None
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    if booking.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="This booking does not belong to you")
        
    # 2. Check if booking is in the past
    if booking.start_time > datetime.utcnow():
        raise HTTPException(status_code=400, detail="Cannot review a future booking")
        
    # 3. Check for existing review
    existing = await Review.find_one(Review.booking_id == review_in.booking_id)
    if existing:
        raise HTTPException(status_code=400, detail="You have already reviewed this booking")
        
    # 4. Insert review
    review = Review(
        ground_id=review_in.ground_id,
        user_id=str(current_user.id),
        booking_id=review_in.booking_id,
        rating=review_in.rating,
        comment=review_in.comment
    )
    await review.insert()
    
    # 5. Update ground avg_rating
    await update_ground_rating(review_in.ground_id)
    
    return review

@router.get("/{ground_id}")
async def get_ground_reviews(ground_id: str) -> List[Any]:
    reviews = await Review.find(Review.ground_id == ground_id).sort("-created_at").to_list()
    
    enriched_reviews = []
    for r in reviews:
        user = await User.get(r.user_id)
        enriched_reviews.append({
            "id": str(r.id),
            "user_name": user.name if user else "Anonymous",
            "rating": r.rating,
            "comment": r.comment,
            "created_at": r.created_at.strftime('%Y-%m-%dT%H:%M:%S.000Z')
        })
    return enriched_reviews

@router.delete("/{review_id}")
async def delete_review(
    review_id: str,
    admin: User = Depends(get_current_active_admin)
) -> Any:
    review = await Review.get(review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    ground_id = review.ground_id
    await review.delete()
    
    # Update ground avg_rating
    await update_ground_rating(ground_id)
    
    return {"message": "Review deleted"}

async def update_ground_rating(ground_id: str):
    ground = await Ground.get(ground_id)
    if not ground:
        return
        
    reviews = await Review.find(Review.ground_id == ground_id).to_list()
    if not reviews:
        ground.avg_rating = None
        ground.review_count = 0
    else:
        total = sum(r.rating for r in reviews)
        ground.avg_rating = round(total / len(reviews), 1)
        ground.review_count = len(reviews)
        
    await ground.save()
