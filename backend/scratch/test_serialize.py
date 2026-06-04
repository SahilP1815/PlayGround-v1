import asyncio
import os
import sys
import json
sys.path.append(os.getcwd())
from app.db.mongodb import init_db
from app.models.ground import Ground

async def test_serialization():
    await init_db()
    g = await Ground.find_one()
    if g:
        data = g.model_dump()
        try:
            json.dumps(data, default=str)
            print("Serialization success")
        except Exception as e:
            print(f"Serialization failed: {e}")
    else:
        print("No grounds found")

if __name__ == "__main__":
    asyncio.run(test_serialization())
