from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from redis.asyncio import Redis

from app.core.database import get_db, get_redis
from app.models.links import Link
from app.services.qr_service import generate_and_save_qr, ensure_bucket

router = APIRouter()

@router.post("/qr/{short_code}", tags=["qr"], summary='Generating QR Code for short link')
async def create_qr(short_code: str, db: AsyncSession = Depends(get_db), redis: Redis = Depends(get_redis)):
    cached_qr = await redis.get(f"qr:{short_code}")
    if cached_qr:
        return {"short_code": short_code, "qr_url": cached_qr}

    result = await db.execute(select(Link).where(Link.short_code == short_code))
    link = result.scalar_one_or_none()

    if not link:
        raise HTTPException(status_code=404, detail="Link not found")

    await ensure_bucket()
    qr_url = await generate_and_save_qr(short_code)

    await redis.set(f"qr:{short_code}", qr_url)

    return {"short_code": short_code, "qr_url": qr_url}