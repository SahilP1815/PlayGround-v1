import asyncio
import os
import sys
sys.path.append(os.getcwd())
from app.db.mongodb import init_db
from app.models.user import User, UserRole

async def list_admins():
    await init_db()
    admins = await User.find(User.role == UserRole.ADMIN).to_list()
    if admins:
        print("\n=== ADMINISTRATORS ===")
        for idx, admin in enumerate(admins, 1):
            print(f"{idx}. Name: {admin.name} | Email: {admin.email}")
        print("======================\n")
    else:
        print("No administrators found in the database.")

if __name__ == "__main__":
    asyncio.run(list_admins())
