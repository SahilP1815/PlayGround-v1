import asyncio
import os
import sys
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

# Add parent directory to path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.user import User
from app.models.ground import Ground
from app.models.booking import Booking, Slot
from app.models.review import Review
from app.models.dispute import Dispute
from app.models.handler import Handler

load_dotenv()

async def migrate():
    mongo_url = os.getenv("MONGODB_URL")
    if not mongo_url:
        print("MONGODB_URL not found in env.")
        return
        
    print(f"Connecting to {mongo_url}...")
    client = AsyncIOMotorClient(mongo_url)
    db = client.get_database("playground")
    
    await init_beanie(
        database=db,
        document_models=[User, Ground, Booking, Slot, Review, Dispute, Handler]
    )
    
    print("Database initialized. Migrating Grounds...")
    
    # 1. Update all existing grounds to have assigned_handler_id: null if not present
    grounds = await Ground.find_all().to_list()
    updated_grounds_count = 0
    for ground in grounds:
        if not hasattr(ground, 'assigned_handler_id'):
            ground.assigned_handler_id = None
            await ground.save()
            updated_grounds_count += 1
            
    print(f"Updated {updated_grounds_count} grounds with assigned_handler_id = null.")
    
    # 2. Update all existing users to have is_handler: False and handler_for_owner_id: null if not present
    users = await User.find_all().to_list()
    updated_users_count = 0
    for user in users:
        modified = False
        if not hasattr(user, 'is_handler'):
            user.is_handler = False
            modified = True
        if not hasattr(user, 'handler_for_owner_id'):
            user.handler_for_owner_id = None
            modified = True
            
        if modified:
            await user.save()
            updated_users_count += 1
            
    print(f"Updated {updated_users_count} users with handler fields.")
    print("Migration complete!")

if __name__ == "__main__":
    asyncio.run(migrate())
