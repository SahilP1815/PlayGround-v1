import asyncio
import os
import sys

# Add current directory to path
sys.path.append(os.getcwd())

from app.db.mongodb import init_db
from app.models.ground import Ground

async def check_grounds():
    await init_db()
    grounds = await Ground.find_all().to_list()
    print(f"Total grounds found: {len(grounds)}")
    for g in grounds:
        print(f"Name: {g.name}, Status: {g.status}, ID: {g.id}")

if __name__ == "__main__":
    asyncio.run(check_grounds())
