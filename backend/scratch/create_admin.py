import asyncio
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from app.models.user import User, UserRole
from app.core.security import get_password_hash
import os
import random
from dotenv import load_dotenv

load_dotenv()

AVATAR_COLORS = ["#1abc9c", "#3498db", "#9b59b6", "#e67e22", "#e74c3c", "#2ecc71", "#f1c40f", "#34495e"]

async def create_or_update_admin(email: str, password: str, name: str):
    client = AsyncIOMotorClient(os.getenv("MONGODB_URL", "mongodb://localhost:27017/playground"))
    await init_beanie(database=client.playground, document_models=[User])

    hashed_password = get_password_hash(password)
    user = await User.find_one(User.email == email)
    
    if user:
        user.hashed_password = hashed_password
        user.role = UserRole.ADMIN
        user.name = name
        await user.save()
        print(f"User {email} successfully updated to ADMIN role with the specified password.")
    else:
        new_user = User(
            name=name,
            email=email,
            hashed_password=hashed_password,
            role=UserRole.ADMIN,
            avatar_color=random.choice(AVATAR_COLORS)
        )
        await new_user.insert()
        print(f"User {email} successfully created as ADMIN with the specified password.")

if __name__ == "__main__":
    email = "sahilpatel0204@gmail.com"
    password = "1234"
    name = "Sahil Patel"
    asyncio.run(create_or_update_admin(email, password, name))
