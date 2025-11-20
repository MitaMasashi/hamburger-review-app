from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import SQLModel, Session, create_engine, select
from typing import List
from models import Review, ReviewCreate, ReviewRead, ReviewUpdate
import shutil
import os
import uuid

sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

app = FastAPI()

# CORS setup
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Image upload setup
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.post("/reviews/", response_model=ReviewRead)
def create_review(review: ReviewCreate, session: Session = Depends(get_session)):
    db_review = Review.from_orm(review)
    session.add(db_review)
    session.commit()
    session.refresh(db_review)
    return db_review

@app.get("/reviews/", response_model=List[ReviewRead])
def read_reviews(offset: int = 0, limit: int = 100, session: Session = Depends(get_session)):
    reviews = session.exec(select(Review).offset(offset).limit(limit)).all()
    return reviews

@app.get("/reviews/{review_id}", response_model=ReviewRead)
def read_review(review_id: int, session: Session = Depends(get_session)):
    review = session.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return review

@app.patch("/reviews/{review_id}", response_model=ReviewRead)
def update_review(review_id: int, review: ReviewUpdate, session: Session = Depends(get_session)):
    db_review = session.get(Review, review_id)
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    review_data = review.dict(exclude_unset=True)
    for key, value in review_data.items():
        setattr(db_review, key, value)
        
    session.add(db_review)
    session.commit()
    session.refresh(db_review)
    return db_review

@app.delete("/reviews/{review_id}")
def delete_review(review_id: int, session: Session = Depends(get_session)):
    review = session.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    session.delete(review)
    session.commit()
    return {"ok": True}

from PIL import Image
import io

@app.post("/upload/")
async def upload_image(file: UploadFile = File(...)):
    file_extension = file.filename.split(".")[-1]
    file_name = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, file_name)
    
    # Save original
    content = await file.read()
    with open(file_path, "wb") as buffer:
        buffer.write(content)
    
    # Generate thumbnail
    try:
        with Image.open(io.BytesIO(content)) as img:
            img.thumbnail((400, 400)) # Max size 400x400
            thumb_name = file_name.replace(f".{file_extension}", f"_thumb.{file_extension}")
            thumb_path = os.path.join(UPLOAD_DIR, thumb_name)
            img.save(thumb_path)
    except Exception as e:
        print(f"Error creating thumbnail: {e}")
        # If thumbnail fails, we just don't have one, frontend should fallback
        
    return {"filename": file_name, "url": f"/uploads/{file_name}"}

@app.get("/export")
def export_reviews(session: Session = Depends(get_session)):
    reviews = session.exec(select(Review)).all()
    # Convert to list of dicts, handling datetime serialization automatically via FastAPI/Pydantic
    return reviews

@app.post("/import")
async def import_reviews(file: UploadFile = File(...), session: Session = Depends(get_session)):
    import json
    contents = await file.read()
    data = json.loads(contents)
    
    count = 0
    for item in data:
        # Remove ID to let DB generate new ones, preventing conflicts
        if "id" in item:
            del item["id"]
        
        # Handle datetime conversion if needed (though Pydantic often handles ISO strings)
        # If visit_date is a string, SQLModel should parse it.
        
        review = Review.from_orm(ReviewCreate(**item))
        session.add(review)
        count += 1
    
    session.commit()
    return {"message": f"Successfully imported {count} reviews"}

# Mount the frontend build directory (must be after API routes to avoid conflicts)
# We assume the frontend is built to ../frontend/dist
FRONTEND_DIST = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")

if os.path.exists(FRONTEND_DIST):
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")

# Fallback for SPA routing (if using client-side routing, though this app is simple)
# For a simple app without React Router, the above mount with html=True is usually enough for the root.
# If we had routes like /reviews/1 in React, we'd need a catch-all.
# Since we don't have client-side routing (everything is on /), we are good.

