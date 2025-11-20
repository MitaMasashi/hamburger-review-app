from typing import Optional
from datetime import datetime
from sqlmodel import Field, SQLModel

class ReviewBase(SQLModel):
    shop_name: str
    burger_name: str
    rating: int = Field(ge=1, le=5, description="Overall satisfaction 1-5")
    rating_style: int = Field(ge=1, le=5, description="1=Junk/Classic, 5=Rich/Gourmet")
    rating_volume: int = Field(ge=1, le=5, description="1=Light/Snack, 5=Heavy/Massive")
    rating_patty: int = Field(ge=1, le=5, description="1=Balanced/Sauce-focused, 5=Meaty/Steak-like")
    rating_buns: int = Field(ge=1, le=5, description="1=Soft/Fluffy, 5=Hard/Crispy")
    rating_sauce: int = Field(ge=1, le=5, description="1=Mild/Simple, 5=Strong/Rich")
    price: int
    visit_date: datetime
    image_url: Optional[str] = None
    tags: Optional[str] = None # Comma separated tags
    comment: Optional[str] = None

class Review(ReviewBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class ReviewCreate(ReviewBase):
    pass

class ReviewRead(ReviewBase):
    id: int

class ReviewUpdate(SQLModel):
    shop_name: Optional[str] = None
    burger_name: Optional[str] = None
    rating: Optional[int] = None
    rating_style: Optional[int] = None
    rating_volume: Optional[int] = None
    rating_patty: Optional[int] = None
    rating_buns: Optional[int] = None
    rating_sauce: Optional[int] = None
    price: Optional[int] = None
    visit_date: Optional[datetime] = None
    image_url: Optional[str] = None
    tags: Optional[str] = None
    comment: Optional[str] = None
