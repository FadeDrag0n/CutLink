from datetime import datetime
from pydantic import BaseModel, HttpUrl
from app.core.config import settings

class LinkCreate(BaseModel):
    original_url: HttpUrl

class LinkResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    short_code: str
    original_url: str
    short_url: str
    clicks: int
    created_at: datetime
