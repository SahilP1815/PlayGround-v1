import os
os.environ["OTEL_PYTHON_DISABLED_INSTRUMENTATIONS"] = "motor"

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from dotenv import load_dotenv

from app.models.user import User
from app.models.ground import Ground
from app.models.booking import Booking, Slot

load_dotenv()

async def init_db():
    try:
        mongo_url = os.getenv("MONGODB_URL")
        if not mongo_url:
            raise ValueError("MONGODB_URL environment variable is not set")
            
        db_name = "playground"
        
        client = AsyncIOMotorClient(mongo_url)
        
        # Verify connection
        await client.admin.command('ping')
        print("Connected to MongoDB Atlas successfully!")
        
        db = client.get_database(db_name)
        
        await init_beanie(
            database=db,
            document_models=[
                User,
                Ground,
                Booking,
                Slot
            ],
        )
        print("Beanie initialized successfully.")
        
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
        raise e
