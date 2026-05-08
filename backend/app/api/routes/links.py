from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import random
import string
from typing import Optional
from app.core.database import get_db, get_redis
from app.core.config import settings
from app.models.links import Link
from app.schemas.links import LinkCreate, LinkResponse
from redis.asyncio import Redis
from app.models.user import User
from app.services.auth_service import get_optional_user, get_current_user

router = APIRouter()

def generate_short_code() -> str:
    chars = string.ascii_letters + string.digits
    return "".join(random.choices(chars, k=settings.SHORT_CODE_LENGTH))

@router.post("/shorten", response_model=LinkResponse, tags=["links"], summary='Create a shortened link')
async def shorten_url(data: LinkCreate,
                      db: AsyncSession = Depends(get_db),
                      redis: Redis = Depends(get_redis),
                      current_user: Optional[User] = Depends(get_optional_user)):
    original_url = str(data.original_url)

    cached_code = await redis.get(f"url:{original_url}")
    if cached_code:
        result = await db.execute(select(Link).where(Link.short_code == cached_code))
        link = result.scalar_one_or_none()
        if link:
            link.short_url = f"{settings.BASE_URL}/{link.short_code}"
            return link

    result = await db.execute(select(Link).where(Link.original_url == original_url))
    existing_link = result.scalar_one_or_none()

    if existing_link:
        existing_link.short_url = f"{settings.BASE_URL}/{existing_link.short_code}"
        return existing_link

    while True:
        short_code = generate_short_code()
        result = await db.execute(select(Link).where(Link.short_code == short_code))
        if not result.scalar_one_or_none():
            break

    link = Link(original_url=original_url, short_code=short_code, user_id=current_user.id if current_user else None)
    db.add(link)
    await db.commit()
    await db.refresh(link)
    await redis.set(f"url:{link.original_url}", link.short_code)
    await redis.set(f"code:{link.short_code}", link.original_url)

    link.short_url = f"{settings.BASE_URL}/{link.short_code}"
    return link

@router.get("/my", response_model=list[LinkResponse], tags=["links"])
async def get_my_links(
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Link).where(Link.user_id == current_user.id))
    links = result.scalars().all()

    for link in links:
        link.short_url = f"{settings.BASE_URL}/{link.short_code}"

    return links

@router.get("/{short_code}", tags=["links"], summary='Redirecting for link')
async def redirect_url(short_code: str, db: AsyncSession = Depends(get_db), redis: Redis = Depends(get_redis)) -> RedirectResponse:

    cached_url = await redis.get(f"code:{short_code}")
    if cached_url:
        await db.execute(
            Link.__table__.update()
            .where(Link.short_code == short_code)
            .values(clicks=Link.clicks + 1)
        )
        await db.commit()
        return RedirectResponse(url=cached_url)

    result = await db.execute(select(Link).where(Link.short_code == short_code))
    link = result.scalar_one_or_none()

    if not link:
        raise HTTPException(status_code=404, detail="Link not found")

    link.clicks += 1
    await db.commit()

    await redis.set(f"code:{short_code}", link.original_url)
    return RedirectResponse(url=link.original_url)