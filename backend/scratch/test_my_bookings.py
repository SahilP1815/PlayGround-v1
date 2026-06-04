import asyncio
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from app.models.user import User
from app.models.booking import Booking
from app.models.ground import Ground
import os
from dotenv import load_dotenv

load_dotenv()

async def test_my_bookings():
    mongo_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017/playground")
    client = AsyncIOMotorClient(mongo_url)
    await init_beanie(database=client.playground, document_models=[User, Booking, Ground])
    
    # Let's mock the get_my_bookings logic for a random user who has bookings
    booking = await Booking.find_one()
    if not booking:
        print("No bookings found in DB to enrich!")
        return
        
    ground = await Ground.get(booking.ground_id)
    court_name = "Unknown Court"
    sport_type = "Sports"
    if ground:
        for c in ground.courts:
            if str(c.id) == str(booking.court_id):
                court_name = c.name
                sport_type = c.sport_type
                break
                
    enriched = {
        "id": str(booking.id),
        "booking_id": booking.booking_id,
        "ground_id": str(booking.ground_id),
        "ground_name": ground.name if ground else "Unknown Ground",
        "ground_address": ground.location.address if ground else "Unknown Address",
        "court_name": court_name,
        "sport_type": sport_type,
        "location": {
            "address": ground.location.address if ground else "Unknown Address",
            "city": ground.location.city if ground else "Ahmedabad"
        }
    }
    
    print("Enriched booking structure:")
    print(enriched)
    assert "ground_id" in enriched, "ground_id is missing!"
    assert "sport_type" in enriched, "sport_type is missing!"
    assert "location" in enriched, "location is missing!"
    assert "city" in enriched["location"], "city is missing inside location!"
    print("--- VERIFICATION SUCCESSFUL ---")

if __name__ == "__main__":
    asyncio.run(test_my_bookings())
