import asyncio
import os
import sys

sys.path.append(os.getcwd())

from app.db.mongodb import init_db
from app.models.ground import Ground

async def print_game_on():
    await init_db()
    g = await Ground.find_one(Ground.name == "Game On")
    if g:
        print(f"Name: {g.name}")
        print(f"Number of images: {len(g.images)}")
        for idx, img in enumerate(g.images):
            print(f"  Image {idx}: type={type(img)}, len={len(img) if img else 0}")
            if isinstance(img, str):
                print(f"    Prefix: {img[:150]}")
        print(f"Status: {g.status}")
    else:
        print("Ground not found.")

if __name__ == "__main__":
    asyncio.run(print_game_on())
