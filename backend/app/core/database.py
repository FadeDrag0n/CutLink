from typing import Any, AsyncGenerator
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text
from app.core.config import settings

redis_client: Redis | None = None

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
)

class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, Any]:
    async with AsyncSessionLocal() as session:
        yield session

async def check_db_connection() -> None:
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        print("PostgresSQL connected successfully")
    except Exception as e:
        print(f"Connection error: {e}")


async def init_redis():
    global redis_client
    redis_client = Redis.from_url(settings.REDIS_URL, decode_responses=True)
    try:
        await redis_client.ping()
        print("Redis connected successfully")
    except Exception as e:
        print(f"Connection error: {e}")

async def get_redis():
    return redis_client

async def close_redis():
    if redis_client:
        await redis_client.close()