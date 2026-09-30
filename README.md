# LIC Agent Platform

A production-ready, full-stack LIC insurance agent business platform built with Next.js 15, FastAPI, PostgreSQL, Redis, and Socket.IO.

> **Disclaimer**: This platform is operated by an individual LIC agent for informational and customer-service purposes. It is not the official LIC website. Policy information is subject to official LIC policy documents, terms, conditions, and applicable rules.

---

## Architecture Overview

```
                    INTERNET
                        |
                        v
                 Cloudflare / CDN
                        |
                        v
                  Next.js App (Port 3000)
                        |
            +-----------+-----------+
            |                       |
            v                       v
       REST API                 Socket.IO
            |                       |
            v                       v
      FastAPI (Port 8000) <---> Redis (Port 6379)
            |
      +-----+------+
      |            |
      v            v
 PostgreSQL      AI Service
 (Port 5432)       |
      |            v
      |         LLM Provider (OpenAI/Gemini)
      |
      +---- pgvector
               |
               v
         Knowledge Base
```

---

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router) + TypeScript
- **UI**: Tailwind CSS + shadcn/ui + Radix UI
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **State**: Zustand (client) + TanStack Query (server)
- **Charts**: Recharts
- **Real-time**: Socket.IO Client
- **Auth**: JWT via HTTP-only cookies

### Backend
- **Framework**: FastAPI + Python 3.12+
- **ORM**: SQLAlchemy 2.x
- **Migrations**: Alembic
- **Database**: PostgreSQL 16 + pgvector
- **Cache/Queue**: Redis
- **Background Jobs**: ARQ (async job queue)
- **Real-time**: python-socketio
- **Auth**: JWT + Argon2 password hashing
- **AI**: RAG with sentence-transformers + LLM provider abstraction
- **Validation**: Pydantic v2

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx
- **Storage**: Local (dev) / S3-compatible (prod)

---

## Project Structure

```
lic-agent-platform/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── app/                # App Router pages
│   │   ├── components/         # Shared UI components
│   │   ├── features/           # Feature modules
│   │   ├── lib/                # Utilities, helpers
│   │   ├── services/           # API service layer
│   │   ├── hooks/              # Custom React hooks
│   │   ├── stores/             # Zustand stores
│   │   └── types/              # TypeScript types
│   │
│   └── api/                    # FastAPI backend
│       └── app/
│           ├── main.py
│           ├── api/v1/         # Route handlers
│           ├── core/           # Config, security, db
│           ├── models/         # SQLAlchemy models
│           ├── schemas/        # Pydantic schemas
│           ├── services/       # Business logic
│           ├── repositories/   # Data access layer
│           ├── websocket/      # Socket.IO handlers
│           ├── ai/             # RAG + AI services
│           ├── tasks/          # Background jobs
│           ├── middleware/     # CORS, auth, rate limit
│           └── tests/          # pytest tests
│
├── packages/
│   ├── shared-types/           # Shared TypeScript types
│   └── config/                 # Shared config
│
├── infrastructure/
│   ├── docker/                 # Dockerfiles
│   ├── nginx/                  # Nginx config
│   └── scripts/                # Utility scripts
│
├── docs/                       # Documentation
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+
- Python 3.12+
- pnpm (recommended)

### 1. Clone and Configure

```bash
git clone <repo>
cd lic-agent-platform
cp .env.example .env
# Edit .env with your values
```

### 2. Start with Docker

```bash
docker-compose up -d
```

### 3. Run Database Migrations

```bash
docker-compose exec api alembic upgrade head
```

### 4. Seed Database

```bash
docker-compose exec api python -m app.scripts.seed
```

### 5. Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |

---

## Development

### Frontend

```bash
cd apps/web
pnpm install
pnpm dev
```

### Backend

```bash
cd apps/api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Database Migrations

```bash
cd apps/api
# Create migration
alembic revision --autogenerate -m "description"
# Apply migrations
alembic upgrade head
# Rollback
alembic downgrade -1
```

---

## Default Credentials (Development)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@licagent.com | Admin@123456 |
| Agent | agent@licagent.com | Agent@123456 |
| Customer | customer@demo.com | Customer@123456 |

> **Change all credentials before production deployment.**

---

## Environment Variables

See [`.env.example`](./.env.example) for all required environment variables.

---

## Documentation

- [Architecture](./docs/architecture.md)
- [API Reference](./docs/api.md)
- [Database Schema](./docs/database.md)
- [Deployment Guide](./docs/deployment.md)
- [AI System](./docs/ai.md)

---

## Legal

This platform is an independent software tool for LIC agents. It is not affiliated with, endorsed by, or the official platform of Life Insurance Corporation of India (LIC). All insurance information is subject to official LIC policy documents.
