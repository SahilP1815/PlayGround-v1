import asyncio
import os
import sys
import httpx
from dotenv import load_dotenv

sys.path.append(os.getcwd())
load_dotenv()

from app.db.mongodb import init_db
from app.models.user import User, UserRole
from app.core.security import create_access_token

async def test_post():
    await init_db()
    # Find an owner
    owner = await User.find_one(User.role == UserRole.OWNER)
    if not owner:
        print("No owner found in DB")
        return
    
    token = create_access_token(str(owner.id))
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "name": "Test Ground",
        "description": "A wonderful test ground",
        "location": {
            "lat": 23.0225,
            "lng": 72.5714,
            "address": "123 Test Street",
            "city": "Ahmedabad",
            "state": "Gujarat",
            "pincode": "380001",
            "landmark": "Near Test Tower"
        },
        "surface_type": "Artificial Turf",
        "ground_size": "7v7",
        "max_players": 14,
        "is_indoor": False,
        "images": [],
        "video_url": None,
        "amenities": ["Parking"],
        "advance_booking_days": 30,
        "cancellation_policy": "flexible",
        "min_booking_duration": 1.0,
        "security_deposit": 0.0,
        "courts": [
            {
                "name": "Court 1",
                "sport_type": "cricket",
                "base_price": 1000.0,
                "surface_type": "Artificial Turf",
                "max_players": 14,
                "is_indoor": False
            }
        ],
        "time_slots": [
            {
                "days": ["Mon", "Tue", "Wed", "Thu", "Fri"],
                "start_time": "06:00",
                "end_time": "23:00",
                "price_per_hour": 1000.0,
                "slot_type": "regular",
                "sport_type": "cricket"
            }
        ],
        "verification_docs": {
            "property_proof": "http://example.com/proof.pdf"
        }
    }
    
    async with httpx.AsyncClient() as client:
        # Try with trailing slash
        res = await client.post("http://127.0.0.1:8000/api/grounds/", json=payload, headers=headers)
        print("POST /api/grounds/ (with slash):", res.status_code, res.text)
        
        # Try without trailing slash
        res_no_slash = await client.post("http://127.0.0.1:8000/api/grounds", json=payload, headers=headers)
        print("POST /api/grounds (no slash):", res_no_slash.status_code, res_no_slash.text)

if __name__ == "__main__":
    asyncio.run(test_post())
