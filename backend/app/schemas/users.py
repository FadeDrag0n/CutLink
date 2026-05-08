from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(max_length=20, min_length=2)
    password: str = Field(max_length=200, min_length=8)
    password_confirm: str = Field(max_length=200, min_length=8)
    age: int = Field(ge=1, le=120)
    gender: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    age: int
    gender: str
    created_at: datetime

    model_config = {"from_attributes": True}