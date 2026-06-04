import asyncio
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from app.models.user import User
import os
from dotenv import load_dotenv

load_dotenv()

async def list_users():
    client = AsyncIOMotorClient(os.getenv("MONGODB_URL", "mongodb://localhost:27017/playground"))
    await init_beanie(database=client.playground, document_models=[User])

    users = await User.find_all().to_list()
    for u in users:
        print(f"Name: {u.name}, Email: {u.email}, Role: {u.role}, ID: {u.id}")

if __name__ == "__main__":
    asyncio.run(list_users())
