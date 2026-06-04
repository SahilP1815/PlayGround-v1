import asyncio
import os
import sys
from bson import ObjectId

sys.path.append(os.getcwd())

from app.db.mongodb import init_db
from app.models.ground import Ground
from app.models.user import User

async def find_ground_owner():
    await init_db()
    g = await Ground.find_one(Ground.name == "Game On")
    if not g:
        print("Ground 'Game On' not found.")
        return

    print(f"Ground Name: {g.name}")
    print(f"Owner ID: {g.owner_id}")

    try:
        user_oid = ObjectId(g.owner_id)
        owner = await User.find_one(User.id == user_oid)
    except Exception as e:
        print(f"Error parsing ObjectId: {e}")
        owner = await User.find_one(User.id == g.owner_id)

    if owner:
        print(f"Owner Name: {owner.name}")
        print(f"Owner Email: {owner.email}")
        print(f"Owner Role: {owner.role}")
    else:
        print(f"Owner with ID {g.owner_id} not found in database.")

if __name__ == "__main__":
    asyncio.run(find_ground_owner())
