# CutLink 🔗

A full-stack URL shortening service with QR code generation, click tracking, and user accounts.

![Stack](https://img.shields.io/badge/FastAPI-0.136-009688?style=flat&logo=fastapi)
![Stack](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)
![Stack](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat&logo=postgresql)
![Stack](https://img.shields.io/badge/Redis-7-DC382D?style=flat&logo=redis)
![Stack](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker)

---

## Features

- **URL Shortening** — paste any long URL and get a short link instantly
- **QR Code Generation** — generate QR codes for any short link, stored in MinIO
- **Click Tracking** — every redirect increments a click counter
- **Redis Caching** — redirects are served from cache without hitting the database
- **User Accounts** — register, login, and manage your own links
- **Dashboard** — view all your links, click stats, and QR codes in one place
- **Anonymous Links** — shorten URLs without an account

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI, SQLAlchemy (async), Alembic |
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Database | PostgreSQL 16 |
| Cache | Redis |
| Storage | MinIO (S3-compatible) |
| Runtime | Docker, Docker Compose |

---

## Project Structure

```
Cutlink_final/
├── backend/               # FastAPI application
│   ├── app/
│   │   ├── api/routes/    # links.py, qr.py, auth.py
│   │   ├── core/          # config.py, database.py
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # auth_service.py, qr_service.py
│   │   └── main.py
│   ├── migrations/        # Alembic migrations
│   ├── Dockerfile
│   ├── .env               # backend environment variables
│   └── pyproject.toml
├── frontend/              # Next.js application
│   ├── app/
│   │   ├── page.tsx       # Home page
│   │   ├── login/         # Login page
│   │   ├── register/      # Register page
│   │   └── dashboard/     # User dashboard
│   ├── components/        # Navbar
│   ├── lib/api.ts         # API client
│   ├── Dockerfile
│   └── .env.local         # frontend environment variables
└── docker-compose.yml
```

---

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose
- Git

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/cutlink.git
cd cutlink
```

### 2. Configure backend environment

Create `backend/.env`:

```env
DATABASE_URL=postgresql+asyncpg://postgres:db_password@postgres:5432/cutlink
SECRET_KEY=your-secret-key-change-in-production
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_ENDPOINT=minio:9000
MINIO_BUCKET=cutlink
MINIO_PUBLIC_URL=http://localhost:9000
MINIO_SECURE=False
BASE_URL=http://localhost:8000
REDIS_URL=redis://redis:6379
ACCESS_TOKEN_EXPIRE_MINUTES=43200
ALGORITHM=HS256
SHORT_CODE_LENGTH=6
```

> Generate a secure SECRET_KEY:
> ```bash
> python -c "import secrets; print(secrets.token_hex(32))"
> ```

### 3. Configure frontend environment

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. Start all services

```bash
docker compose up -d --build
```

This will start:
- **Frontend** → http://localhost:3000
- **Backend API** → http://localhost:8000
- **API Docs** → http://localhost:8000/docs
- **MinIO Console** → http://localhost:9001

### 5. Run database migrations

Migrations run automatically on backend startup via the Dockerfile CMD.

To run manually:

```bash
docker exec cutlink_backend uv run alembic upgrade head
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and get JWT token |
| GET | `/auth/me` | Get current user info |

### Links
| Method | Endpoint | Description |
|---|---|---|
| POST | `/shorten` | Create a short link |
| GET | `/{short_code}` | Redirect to original URL |
| GET | `/my` | Get all links for current user |

### QR Codes
| Method | Endpoint | Description |
|---|---|---|
| POST | `/qr/{short_code}` | Generate QR code for a short link |

Full interactive docs available at `http://localhost:8000/docs`

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | required |
| `SECRET_KEY` | JWT signing secret | required |
| `REDIS_URL` | Redis connection string | `redis://redis:6379` |
| `MINIO_ENDPOINT` | MinIO host | `minio:9000` |
| `MINIO_ACCESS_KEY` | MinIO access key | `minioadmin` |
| `MINIO_SECRET_KEY` | MinIO secret key | `minioadmin` |
| `MINIO_BUCKET` | MinIO bucket name | `cutlink` |
| `MINIO_PUBLIC_URL` | Public URL for QR images | `http://localhost:9000` |
| `MINIO_SECURE` | Use HTTPS for MinIO | `False` |
| `BASE_URL` | Base URL for short links | `http://localhost:8000` |
| `SHORT_CODE_LENGTH` | Length of generated short codes | `6` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT token lifetime in minutes | `43200` (30 days) |

### Frontend (`frontend/.env.local`)

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` |

---

## Development

### Run backend locally (without Docker)

```bash
cd backend
uv add fastapi uvicorn sqlalchemy asyncpg alembic pydantic-settings redis segno miniopy-async psycopg2-binary passlib python-jose python-multipart email-validator bcrypt==4.0.1
uv run uvicorn app.main:app --reload
```

### Run frontend locally (without Docker)

```bash
cd frontend
npm install
npm run dev
```

---

## Production Deployment

For production, update the following in your `.env` files:

```env
# backend/.env
SECRET_KEY=<strong-random-secret>
BASE_URL=https://yourdomain.com
MINIO_PUBLIC_URL=https://storage.yourdomain.com
MINIO_SECURE=True

# frontend/.env.local
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

Also update CORS origins in `backend/app/main.py`:

```python
allow_origins=["https://yourdomain.com"]
```

---

## License

MIT
