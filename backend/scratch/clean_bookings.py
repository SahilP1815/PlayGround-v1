import asyncio
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from app.models.user import User
from app.models.booking import Booking
import os
from dotenv import load_dotenv

load_dotenv()

async def clean_utkarsh_bookings():
    client = AsyncIOMotorClient(os.getenv("MONGODB_URL", "mongodb://localhost:27017/playground"))
    await init_beanie(database=client.playground, document_models=[User, Booking])

    # 1. Find all users named 'utkarsh'
    users = await User.find(User.name == "utkarsh").to_list()
    
    if not users:
        print("No users named 'utkarsh' found.")
        return

    for user in users:
        print(f"Clearing bookings for user: {user.name} ({user.email}) - ID: {user.id}")
        deleted = await Booking.find(Booking.user_id == str(user.id)).delete()
        print(f"Removed bookings.")

if __name__ == "__main__":
    asyncio.run(clean_utkarsh_bookings())
