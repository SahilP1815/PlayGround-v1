import asyncio
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from app.models.ground import Ground, GroundStatus
from app.models.user import User
from app.models.booking import Booking

async def check_grounds():
    client = AsyncIOMotorClient("mongodb+srv://sahil:sahil123@cluster0.z2s8z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    await init_beanie(database=client.get_default_database(), document_models=[Ground, User, Booking])
    
    verified_grounds = await Ground.find(Ground.status == GroundStatus.VERIFIED).to_list()
    pending_grounds = await Ground.find(Ground.status == GroundStatus.PENDING).to_list()
    draft_grounds = await Ground.find(Ground.status == GroundStatus.DRAFT).to_list()
    
    print(f"Verified: {len(verified_grounds)}")
    for g in verified_grounds:
        print(f" - {g.name} (ID: {g.id})")
        
    print(f"Pending: {len(pending_grounds)}")
    for g in pending_grounds:
        print(f" - {g.name} (ID: {g.id})")
        
    print(f"Draft: {len(draft_grounds)}")
    for g in draft_grounds:
        print(f" - {g.name} (ID: {g.id})")

if __name__ == "__main__":
    asyncio.run(check_grounds())
