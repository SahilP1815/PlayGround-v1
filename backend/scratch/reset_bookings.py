import asyncio
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from app.models.booking import Booking
from app.models.user import User
import os
from dotenv import load_dotenv

load_dotenv()

async def reset_all_bookings():
    client = AsyncIOMotorClient(os.getenv("MONGODB_URL", "mongodb://localhost:27017/playground"))
    # Note: We need to list all models used in the system if they are related, 
    # but here we just need Booking to delete them.
    await init_beanie(database=client.playground, document_models=[Booking, User])

    count = await Booking.find_all().count()
    print(f"Found {count} bookings to delete.")
    
    await Booking.find_all().delete()
    print("Successfully cleared all bookings from the system.")

if __name__ == "__main__":
    asyncio.run(reset_all_bookings())
