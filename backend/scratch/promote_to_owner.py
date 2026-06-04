import sys
import os
# Add parent directory of scratch (which is backend/) to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import asyncio
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from app.models.user import User, UserRole
from dotenv import load_dotenv

load_dotenv()

async def promote_to_owner(email: str):
    client = AsyncIOMotorClient(os.getenv("MONGODB_URL", "mongodb://localhost:27017/playground"))
    await init_beanie(database=client.playground, document_models=[User])

    user = await User.find_one(User.email == email)
    if not user:
        print(f"User with email {email} not found.")
        return

    user.role = UserRole.OWNER
    await user.save()
    print(f"User {email} role updated to OWNER.")

if __name__ == "__main__":
    email = "sahil.patel@petpooja.com"
    asyncio.run(promote_to_owner(email))
