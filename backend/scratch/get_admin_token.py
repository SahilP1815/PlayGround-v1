import asyncio
import os
import sys
sys.path.append(os.getcwd())
from app.db.mongodb import init_db
from app.models.user import User, UserRole
from app.core.security import create_access_token

async def get_token():
    await init_db()
    user = await User.find_one(User.role == UserRole.ADMIN)
    if user:
        token = create_access_token(str(user.id))
        print(f"TOKEN:{token}")
    else:
        print("No admin found")

if __name__ == "__main__":
    asyncio.run(get_token())
