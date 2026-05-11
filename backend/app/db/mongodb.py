from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import os
from dotenv import load_dotenv
from app.models.user import User
from app.models.ground import Ground
from app.models.booking import Booking, Slot

load_dotenv()

async def init_db():
    try:
        mongo_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017/playground")
        db_name = "playground"
        client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=5000)
        
        await init_beanie(
            database=client[db_name],
            document_models=[
                User,
                Ground,
                Booking,
                Slot
            ],
        )
        print("Connected to MongoDB Atlas successfully!")
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
        print("Backend starting in mock/limited mode.")
