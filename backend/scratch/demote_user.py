import asyncio
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from app.models.user import User, UserRole
import os
from dotenv import load_dotenv

load_dotenv()

async def demote_user(email: str):
    client = AsyncIOMotorClient(os.getenv("MONGODB_URL", "mongodb://localhost:27017/playground"))
    await init_beanie(database=client.playground, document_models=[User])

    user = await User.find_one(User.email == email)
    if not user:
        print(f"User with email {email} not found.")
        return

    user.role = UserRole.USER
    await user.save()
    print(f"User {email} role updated to USER.")

if __name__ == "__main__":
    import sys
    emails = ["sahil@gmail.com", "sahil.patel@petpooja.com"]
    for email in emails:
        asyncio.run(demote_user(email))
