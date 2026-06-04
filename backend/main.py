from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.mongodb import init_db
from app.api.auth import router as auth_router
from app.api.grounds import router as ground_router
from app.api.slots import router as slot_router
from app.api.bookings import router as booking_router
from app.api.admin import router as admin_router
from app.api.reviews import router as review_router
from app.api.uploads import router as upload_router
from app.api.disputes import router as disputes_router
from app.api.handlers import router as handlers_router
from fastapi.staticfiles import StaticFiles
import uvicorn
from dotenv import load_dotenv

# import googlemaps
# import os

# API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
# gmaps = googlemaps.Client(key=API_KEY)
# result = gmaps.geocode("Ahmedabad, Gujarat, India")
# print(result)

# Load environment variables
load_dotenv()

app = FastAPI(title="PlayGround API", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Routes
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(ground_router, prefix="/api/grounds", tags=["grounds"])
app.include_router(slot_router, prefix="/api/slots", tags=["slots"])
app.include_router(booking_router, prefix="/api/bookings", tags=["bookings"])
app.include_router(admin_router, prefix="/api/admin", tags=["admin"])
app.include_router(review_router, prefix="/api/reviews", tags=["reviews"])
app.include_router(upload_router, prefix="/api/uploads", tags=["uploads"])
app.include_router(disputes_router, prefix="/api/disputes", tags=["disputes"])
app.include_router(handlers_router)

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.on_event("startup")
async def startup_event():
    try:
        await init_db()
    except Exception as e:
        print(f"Error: Database initialization failed: {e}")

@app.get("/")
async def root():
    return {"message": "Welcome to PlayGround API"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
