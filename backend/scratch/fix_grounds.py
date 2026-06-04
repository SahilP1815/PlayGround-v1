import asyncio
import os
import sys

# Add current directory to path
sys.path.append(os.getcwd())

from app.db.mongodb import init_db
from app.models.ground import Ground, GroundStatus

async def fix_grounds():
    await init_db()
    grounds = await Ground.find(Ground.status == GroundStatus.DRAFT).to_list()
    print(f"Updating {len(grounds)} grounds from DRAFT to PENDING...")
    for g in grounds:
        g.status = GroundStatus.PENDING
        await g.save()
    print("Done.")

if __name__ == "__main__":
    asyncio.run(fix_grounds())
