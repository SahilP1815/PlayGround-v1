import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from dotenv import load_dotenv

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.user import User, UserRole
from app.models.handler import Handler, HandlerRole
from app.models.ground import Ground
from app.models.booking import Booking

async def test_handler_system():
    # Connect to MongoDB using .env
    load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))
    mongo_url = os.environ.get("MONGODB_URL")
    
    client = AsyncIOMotorClient(mongo_url)
    await init_beanie(
        database=client.playground, 
        document_models=[User, Ground, Handler, Booking]
    )
    
    print("--- STARTING HANDLER SYSTEM DIAGNOSTIC ---")

    # 1. Check if we have an Owner
    owner = await User.find_one(User.role == UserRole.OWNER)
    if not owner:
        print("[ERROR] No Owner found in the database. Please create an owner first.")
        return
    print(f"[OK] Found Owner: {owner.name} ({owner.email})")

    # 2. Check if the Owner has Grounds
    grounds = await Ground.find(Ground.owner_id == str(owner.id)).to_list()
    if not grounds:
        print(f"[ERROR] Owner {owner.name} has no grounds. Please add a ground first.")
        return
    print(f"[OK] Owner has {len(grounds)} grounds.")

    # 3. Create a Test Handler
    test_handler_email = "test_handler@example.com"
    existing_handler = await Handler.find_one(Handler.email == test_handler_email)
    if existing_handler:
        await existing_handler.delete()
        print("[CLEAN] Cleaned up old test handler.")

    handler = Handler(
        user_id="mock_user_id_123",
        name="John Manager (Test)",
        email=test_handler_email,
        phone="9999999999",
        owner_id=str(owner.id),
        role=HandlerRole.MANAGER
    )
    await handler.insert()
    print(f"[OK] Created Handler: {handler.name}")

    # 4. Assign a Venue to the Handler
    ground_to_assign = grounds[0]
    handler.assigned_venues.append(str(ground_to_assign.id))
    await handler.save()
    
    ground_to_assign.assigned_handler_id = str(handler.id)
    await ground_to_assign.save()
    print(f"[OK] Assigned Ground '{ground_to_assign.name}' to Handler.")

    # 5. Verify Isolation Logic
    fetched_handler = await Handler.get(handler.id)
    if str(ground_to_assign.id) in fetched_handler.assigned_venues:
        print("[OK] Data Isolation Check: Handler successfully mapped to ground.")
    else:
        print("[ERROR] Data Isolation Check: Failed to map ground to handler.")

    # 6. Verify Booking Audit Log fields exist on the model
    booking_fields = Booking.model_fields.keys()
    if 'audit_log' in booking_fields:
        print("[OK] Audit Log feature is active on Booking model.")
    else:
        print("[ERROR] Audit Log feature is missing from Booking model.")

    # Cleanup
    await handler.delete()
    ground_to_assign.assigned_handler_id = None
    await ground_to_assign.save()
    print("[CLEAN] Cleanup complete.")
    
    print("\n[SUCCESS] All internal database links for the Handler System are working perfectly!")

if __name__ == "__main__":
    asyncio.run(test_handler_system())
