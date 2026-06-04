import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

# Ensure directory exists relative to backend root
UPLOAD_DIR = "static/uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
MAX_SIZE = 5 * 1024 * 1024 # 5MB

@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    # Check if user is owner or admin
    if current_user.role not in ["owner", "admin"]:
        raise HTTPException(status_code=403, detail="Only owners can upload images")

    # Validate extension
    extension = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPG, PNG, WEBP are allowed.")

    # Validate size
    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max 5MB.")

    # Generate filename
    unique_filename = f"{uuid.uuid4().hex}_{file.filename.replace(' ', '_')}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save file
    with open(file_path, "wb") as f:
        f.write(contents)
        
    return {"url": f"/static/uploads/{unique_filename}"}

@router.post("/document")
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["owner", "admin"]:
        raise HTTPException(status_code=403, detail="Only owners can upload documents")

    DOCS_DIR = os.path.join(UPLOAD_DIR, "docs")
    if not os.path.exists(DOCS_DIR):
        os.makedirs(DOCS_DIR, exist_ok=True)

    allowed_doc_extensions = {"pdf", "jpg", "jpeg", "png"}
    max_doc_size = 10 * 1024 * 1024 # 10MB

    extension = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if extension not in allowed_doc_extensions:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF, JPG, PNG are allowed.")

    contents = await file.read()
    if len(contents) > max_doc_size:
        raise HTTPException(status_code=400, detail="File too large. Max 10MB.")

    unique_filename = f"{uuid.uuid4().hex}_{file.filename.replace(' ', '_')}"
    file_path = os.path.join(DOCS_DIR, unique_filename)
    
    with open(file_path, "wb") as f:
        f.write(contents)
        
    return {"url": f"/static/uploads/docs/{unique_filename}"}
