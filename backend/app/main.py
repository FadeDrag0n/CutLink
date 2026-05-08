from fastapi import FastAPI
import uvicorn
from contextlib import asynccontextmanager
from app.core.database import check_db_connection, close_redis, init_redis
from app.api.routes.links import router as links_router
from app.api.routes.qr import router as qr_router
from app.api.routes.auth import router as auth_router
from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    await check_db_connection()
    await init_redis()
    yield
    await close_redis()

#doing front  222

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(links_router)
app.include_router(qr_router)
app.include_router(auth_router)

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)