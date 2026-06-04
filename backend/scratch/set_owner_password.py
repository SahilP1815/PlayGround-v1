import asyncio
import os
import sys
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.mongodb import init_db
from app.models.user import User
from app.core.security import get_password_hash

load_dotenv()

async def run():
    await init_db()
    owner = await User.find_one(User.email == "sahil.patel@petpooja.com")
    if owner:
        owner.hashed_password = get_password_hash("password123")
        owner.role = "owner"
        await owner.save()
        print("Owner password updated successfully to 'password123'.")
    else:
        print("Owner not found.")

if __name__ == "__main__":
    asyncio.run(run())
