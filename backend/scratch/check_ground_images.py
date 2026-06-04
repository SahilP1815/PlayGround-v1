import asyncio
import os
import sys

sys.path.append(os.getcwd())

from app.db.mongodb import init_db
from app.models.ground import Ground

async def check_ground_images():
    await init_db()
    grounds = await Ground.find_all().to_list()
    print(f"Total grounds found: {len(grounds)}")
    for g in grounds:
        print(f"Name: {g.name}")
        print(f"  Images: {g.images}")
        print(f"  Status: {g.status}")
        print(f"  ID: {g.id}")

if __name__ == "__main__":
    asyncio.run(check_ground_images())
