from fastapi import APIRouter, Depends, HTTPException, status
from app.models.ground import Ground, Court
from app.models.user import User
from app.schemas.ground import GroundCreate, GroundResponse
from app.api.deps import get_current_user, get_current_active_owner
from typing import List, Any

router = APIRouter()

@router.post("/", response_model=GroundResponse)
async def create_ground(
    ground_in: GroundCreate,
    current_owner: User = Depends(get_current_active_owner)
) -> Any:
    # Convert CourtCreate schemas to Court models
    courts = [
        Court(name=c.name, sport_type=c.sport_type, base_price=c.base_price)
        for c in ground_in.courts
    ]
    
    new_ground = Ground(
        owner_id=str(current_owner.id),
        name=ground_in.name,
        description=ground_in.description,
        location=ground_in.location.model_dump(),
        images=ground_in.images,
        courts=courts
    )
    await new_ground.insert()
    return new_ground

@router.get("/my", response_model=List[GroundResponse])
async def list_my_grounds(
    current_owner: User = Depends(get_current_active_owner)
) -> Any:
    grounds = await Ground.find(Ground.owner_id == str(current_owner.id)).to_list()
    return grounds

@router.get("/", response_model=List[GroundResponse])
async def list_grounds() -> Any:
    grounds = await Ground.find_all().to_list()
    return grounds

@router.get("/{ground_id}", response_model=GroundResponse)
async def get_ground(ground_id: str) -> Any:
    ground = await Ground.get(ground_id)
    if not ground:
        raise HTTPException(status_code=404, detail="Ground not found")
    return ground
