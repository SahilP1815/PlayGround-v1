import asyncio
import os
import sys
sys.path.append(os.getcwd())
from app.db.mongodb import init_db
from app.models.ground import Ground, GroundStatus

async def fix():
    await init_db()
    grounds = await Ground.find(Ground.status != GroundStatus.VERIFIED).to_list()
    for g in grounds:
        g.status = GroundStatus.PENDING
        await g.save()
    print(f"Updated {len(grounds)} grounds to PENDING.")

if __name__ == "__main__":
    asyncio.run(fix())
