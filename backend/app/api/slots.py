from fastapi import APIRouter, Depends, HTTPException, status
from app.models.booking import Slot, SlotStatus
from app.models.ground import Ground
from datetime import datetime, timedelta
from typing import List, Any
from pydantic import BaseModel

router = APIRouter()

class SlotGenerateRequest(BaseModel):
    ground_id: str
    court_id: str
    date: str  # YYYY-MM-DD
    start_hour: int = 6  # 6 AM
    end_hour: int = 22  # 10 PM
    duration_minutes: int = 60

@router.get("/{ground_id}/slots")
async def get_slots(ground_id: str, date: str) -> Any:
    # Fetch slots for a specific ground and date
    # In a real app, you'd filter by start_time being on that date
    start_of_day = datetime.strptime(date, "%Y-%m-%d")
    end_of_day = start_of_day + timedelta(days=1)
    
    slots = await Slot.find(
        Slot.ground_id == ground_id,
        Slot.start_time >= start_of_day,
        Slot.start_time < end_of_day
    ).to_list()
    
    return slots

@router.post("/generate")
async def generate_slots(req: SlotGenerateRequest) -> Any:
    # Admin/Owner only in production
    ground = await Ground.get(req.ground_id)
    if not ground:
        raise HTTPException(status_code=404, detail="Ground not found")
    
    # Find the court
    court = next((c for c in ground.courts if str(c.id) == req.court_id), None)
    if not court:
        raise HTTPException(status_code=404, detail="Court not found")
    
    date_obj = datetime.strptime(req.date, "%Y-%m-%d")
    current_time = date_obj.replace(hour=req.start_hour)
    end_time_limit = date_obj.replace(hour=req.end_hour)
    
    new_slots = []
    while current_time + timedelta(minutes=req.duration_minutes) <= end_time_limit:
        slot_end = current_time + timedelta(minutes=req.duration_minutes)
        
        # Check if slot already exists
        existing = await Slot.find_one(
            Slot.ground_id == req.ground_id,
            Slot.court_id == req.court_id,
            Slot.start_time == current_time
        )
        
        if not existing:
            slot = Slot(
                ground_id=req.ground_id,
                court_id=req.court_id,
                start_time=current_time,
                end_time=slot_end,
                price=court.base_price,
                status=SlotStatus.AVAILABLE
            )
            await slot.insert()
            new_slots.append(slot)
            
        current_time = slot_end
        
    return {"message": f"Generated {len(new_slots)} slots", "slots": new_slots}
