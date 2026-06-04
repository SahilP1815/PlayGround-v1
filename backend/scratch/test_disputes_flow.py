import asyncio
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from app.models.user import User
from app.models.booking import Booking
from app.models.dispute import Dispute
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

async def test_dispute_flow():
    mongo_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017/playground")
    client = AsyncIOMotorClient(mongo_url)
    
    # Initialize Beanie
    await init_beanie(
        database=client.playground, 
        document_models=[User, Booking, Dispute]
    )
    
    print("Database connected and initialized.")

    # 1. Clean up old test disputes
    await Dispute.find(Dispute.reason_category == "Test Category").delete()
    print("Cleaned up old test disputes.")

    # 2. Get or create a mock booking
    booking = await Booking.find_one()
    if not booking:
        print("No booking found! Creating a test booking.")
        booking = Booking(
            user_id="test_user_id",
            ground_id="test_ground_id",
            court_id="cricket-court-1",
            start_time=datetime.utcnow(),
            total_price=500.0,
            booking_id="BK-TEST-123"
        )
        await booking.insert()

    print(f"Using booking ID: {booking.id} (Human: {booking.booking_id})")

    # 3. Create a Dispute
    dispute = Dispute(
        booking_id=str(booking.id),
        user_id=booking.user_id,
        ground_id=booking.ground_id,
        reason_category="Test Category",
        description="This is a test dispute description",
        status="open"
    )
    await dispute.insert()
    print(f"Created a test dispute with ID: {dispute.id}")

    # 4. Assert disputes count
    open_count = await Dispute.find(Dispute.status == "open").count()
    print(f"Open disputes in DB: {open_count}")
    assert open_count >= 1, "Dispute wasn't counted correctly!"

    # 5. Resolve the Dispute
    dispute.status = "resolved"
    dispute.resolution = "refunded"
    dispute.admin_notes = "Resolved as refunded in automated test"
    await dispute.save()
    print("Resolved dispute in database.")

    # 6. Verify state
    updated_dispute = await Dispute.get(dispute.id)
    assert updated_dispute.status == "resolved", "Dispute status didn't update!"
    assert updated_dispute.resolution == "refunded", "Dispute resolution didn't update!"
    
    # Clean up test dispute
    await Dispute.find(Dispute.id == dispute.id).delete()
    print("Cleaned up temporary test dispute.")
    print("\n--- ALL TESTS PASSED SUCCESSFULLY! ---")

if __name__ == "__main__":
    asyncio.run(test_dispute_flow())
