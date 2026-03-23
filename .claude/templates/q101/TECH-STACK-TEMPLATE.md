# Tech Stack Standardization Guide

This document defines the mandatory technology stack and implementation standards for all modules in the ChristyNg TikTok Live-Selling Automation Platform. All modules **MUST** comply with these standards to ensure consistency, ease of integration, and maintainability.

## Table of Contents

- [Overview](#overview)
- [Frontend UI Stack](#frontend-ui-stack)
- [Backend API Stack](#backend-api-stack)
- [Database Stack](#database-stack)
- [Message Queue & Caching](#message-queue--caching)
- [AI/LLM Integration](#aillm-integration)
- [DevOps & Infrastructure](#devops--infrastructure)
- [Module Compliance Matrix](#module-compliance-matrix)
- [Implementation Patterns](#implementation-patterns)
- [Migration Guidelines](#migration-guidelines)

---

## Overview

### Design Principles

1. **Consistency**: All modules use identical tech stacks for their respective tiers
2. **Modularity**: Each module is independently deployable
3. **Scalability**: Async-first architecture with background task processing
4. **Maintainability**: Shared patterns, conventions, and code structure

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND TIER                                   │
│                     React 18+ / Vite / TailwindCSS                          │
│                         Port Range: 4001-4008                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND TIER                                    │
│                    FastAPI / Uvicorn / Pydantic v2                          │
│                         Port Range: 5001-5008                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
┌─────────────────────┐  ┌─────────────────┐  ┌─────────────────────┐
│     PostgreSQL      │  │      Redis      │  │    Celery Worker    │
│     Port: 5432      │  │   Port: 6379    │  │  Flower: 555X       │
│   (Shared Instance) │  │ (Shared, DB 1-8)│  │  (Per Module)       │
└─────────────────────┘  └─────────────────┘  └─────────────────────┘
```

---

## Frontend UI Stack

### Mandatory Technologies

| Technology | Version | Purpose | Required |
|------------|---------|---------|----------|
| **React** | 18.x+ | UI Framework | YES |
| **Vite** | 5.x+ | Build Tool & Dev Server | YES |
| **TypeScript** | 5.x+ | Type Safety | YES |
| **TailwindCSS** | 3.x+ | Styling | YES |
| **React Router** | 6.x+ | Client-side Routing | YES |
| **React Query** | @tanstack/react-query 5.x+ | Server State Management | YES |
| **Axios** | 1.x+ | HTTP Client | YES |

### Recommended Libraries

| Library | Purpose | When to Use |
|---------|---------|-------------|
| **shadcn/ui** | UI Components | Complex UI elements |
| **recharts** | Charts & Graphs | Analytics dashboards |
| **react-player** | Video Playback | Video preview/player |
| **@tanstack/react-table** | Data Tables | Lists, grids |
| **react-hook-form** | Form Handling | Complex forms |
| **zod** | Schema Validation | Form validation |
| **date-fns** | Date Formatting | Date/time display |

### Directory Structure (Standard)

```
src/ui/
├── public/
│   └── favicon.ico
├── src/
│   ├── api/                    # API client functions
│   │   ├── client.ts           # Axios instance configuration
│   │   ├── jobs.ts             # Job-related API calls
│   │   └── index.ts            # Export all API functions
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Base UI components (shadcn)
│   │   ├── layout/             # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Layout.tsx
│   │   └── shared/             # Shared business components
│   ├── hooks/                  # Custom React hooks
│   │   ├── useJobs.ts
│   │   └── useApi.ts
│   ├── pages/                  # Page components (routes)
│   │   ├── Dashboard.tsx
│   │   ├── JobList.tsx
│   │   ├── JobDetail.tsx
│   │   └── index.ts
│   ├── types/                  # TypeScript type definitions
│   │   ├── api.ts
│   │   └── models.ts
│   ├── utils/                  # Utility functions
│   │   ├── format.ts
│   │   └── constants.ts
│   ├── App.tsx                 # Main app component
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles (Tailwind)
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

### Vite Configuration (Standard)

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Module N: {ModuleName} - See ../../../PORTS.md for port allocation
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 400N,  // Replace N with module number (1-8)
    proxy: {
      '/api': {
        target: 'http://localhost:500N',  // Replace N with module number
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
```

### Package.json (Standard)

```json
{
  "name": "{module-name}-ui",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@tanstack/react-query": "^5.8.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5",
    "typescript": "^5.2.2",
    "vite": "^5.0.0"
  }
}
```

---

## Backend API Stack

### Mandatory Technologies

| Technology | Version | Purpose | Required |
|------------|---------|---------|----------|
| **Python** | 3.11+ | Runtime | YES |
| **FastAPI** | 0.104+ | Web Framework | YES |
| **Uvicorn** | 0.24+ | ASGI Server | YES |
| **Pydantic** | 2.x+ | Data Validation | YES |
| **SQLAlchemy** | 2.x+ | ORM | YES |
| **Alembic** | 1.x+ | Database Migrations | YES |
| **Celery** | 5.x+ | Task Queue | YES |
| **httpx** | 0.25+ | Async HTTP Client | YES |

### Recommended Libraries

| Library | Purpose | When to Use |
|---------|---------|-------------|
| **aiofiles** | Async File Operations | File uploads/downloads |
| **python-multipart** | Form Data | File uploads |
| **python-jose** | JWT Handling | Authentication |
| **passlib** | Password Hashing | User auth |
| **tenacity** | Retry Logic | External API calls |
| **structlog** | Structured Logging | Production logging |

### Directory Structure (Standard)

```
tiktok-vid-N-{name}/
├── src/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app entry point
│   ├── config.py               # Pydantic Settings configuration
│   ├── database.py             # Database connection & session
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py             # Dependency injection
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── jobs.py         # Job endpoints
│   │       ├── health.py       # Health check endpoints
│   │       └── {resource}.py   # Resource-specific endpoints
│   ├── models/
│   │   ├── __init__.py
│   │   ├── base.py             # Base model class
│   │   ├── job.py              # Job model
│   │   └── {model}.py          # Domain models
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── job.py              # Job Pydantic schemas
│   │   └── {schema}.py         # Request/Response schemas
│   ├── services/
│   │   ├── __init__.py
│   │   ├── llm_service.py      # LLM provider abstraction
│   │   └── {service}.py        # Business logic services
│   ├── agents/                 # AI Agents (if applicable)
│   │   ├── __init__.py
│   │   └── {agent}.py
│   └── workers/
│       ├── __init__.py
│       ├── celery_app.py       # Celery configuration
│       └── tasks.py            # Celery tasks
├── tests/
│   ├── __init__.py
│   ├── conftest.py             # Pytest fixtures
│   ├── test_api/
│   └── test_services/
├── alembic/
│   ├── env.py
│   ├── versions/
│   └── alembic.ini
├── docker/
│   └── Dockerfile
├── .env.example
├── docker-compose.yml
├── requirements.txt
├── requirements-dev.txt
├── pyproject.toml
├── CLAUDE.md
├── PRD.md                      # Product Requirements Document
└── PRP.md                      # Product Requirements Prompt
```

### FastAPI App Structure (Standard)

```python
# src/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config import settings
from src.database import init_db
from src.api.routes import jobs, health

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    await init_db()
    yield
    # Shutdown (cleanup if needed)

app = FastAPI(
    title=f"TikTok {settings.module_name} API",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[f"http://localhost:{settings.vite_port}"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(jobs.router, prefix="/api/v1", tags=["Jobs"])
```

### Config Pattern (Standard)

```python
# src/config.py
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    """Application settings loaded from environment."""

    # Module identification
    module_name: str = "researcher"
    module_number: int = 1

    # Port configuration
    api_port: int = Field(default=5001, alias="API_PORT")
    vite_port: int = Field(default=4001, alias="VITE_PORT")
    flower_port: int = Field(default=5551, alias="FLOWER_PORT")
    ws_port: int = Field(default=6001, alias="WS_PORT")

    # Database
    database_url: str = Field(
        default="sqlite+aiosqlite:///./app.db",
        alias="DATABASE_URL"
    )

    # Redis
    redis_url: str = Field(
        default="redis://localhost:6379/1",
        alias="REDIS_URL"
    )

    # API Keys
    anthropic_api_key: str = Field(default="", alias="ANTHROPIC_API_KEY")

    # Cross-module integration
    # Add URLs for adjacent modules in pipeline

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
```

---

## Database Stack

### Primary Database: PostgreSQL

| Setting | Value | Notes |
|---------|-------|-------|
| **Version** | 15+ | Use Alpine image for smaller size |
| **Port** | 5432 | Shared across all modules |
| **Driver (Async)** | asyncpg | For async SQLAlchemy |
| **Driver (Sync)** | psycopg2-binary | For Alembic migrations |

### Database Naming Convention

| Module | Database Name |
|--------|---------------|
| 1. Researcher | `tiktok_researcher` |
| 2. Clipper | `tiktok_clipper` |
| 3. Generator | `tiktok_generator` |
| 4. Reviewer | `tiktok_reviewer` |
| 5. Scheduler | `tiktok_scheduler` |
| 6. Publisher | `tiktok_publisher` |
| 7. Monetizer | `tiktok_monetizer` |
| 8. Evaluator | `tiktok_evaluator` |

### SQLAlchemy Model Pattern

```python
# src/models/base.py
from datetime import datetime
from uuid import uuid4
from sqlalchemy import Column, DateTime, String
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class TimestampMixin:
    """Mixin for created_at and updated_at timestamps."""
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class UUIDMixin:
    """Mixin for UUID primary key."""
    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
```

### Job Linkage Pattern (Cross-Module)

All modules MUST implement job linkage for pipeline tracing:

```python
class ModuleJob(Base, UUIDMixin, TimestampMixin):
    """Base job pattern for all modules."""
    __tablename__ = "jobs"

    # This module's job ID (inherited from UUIDMixin)

    # Link to previous module's job
    parent_job_id = Column(String(36), nullable=True, index=True)

    # Link to Module 1's original job (always Researcher)
    origin_job_id = Column(String(36), nullable=True, index=True)

    # Job status
    status = Column(String(20), default="pending", index=True)
```

---

## Message Queue & Caching

### Redis Configuration

| Setting | Value | Notes |
|---------|-------|-------|
| **Version** | 7+ | Use Alpine image |
| **Port** | 6379 | Shared across all modules |
| **Module DB Isolation** | DB 1-8 | Each module uses separate DB |

### Redis DB Allocation

| Module | Redis DB | URL |
|--------|----------|-----|
| 1. Researcher | DB 1 | `redis://localhost:6379/1` |
| 2. Clipper | DB 2 | `redis://localhost:6379/2` |
| 3. Generator | DB 3 | `redis://localhost:6379/3` |
| 4. Reviewer | DB 4 | `redis://localhost:6379/4` |
| 5. Scheduler | DB 5 | `redis://localhost:6379/5` |
| 6. Publisher | DB 6 | `redis://localhost:6379/6` |
| 7. Monetizer | DB 7 | `redis://localhost:6379/7` |
| 8. Evaluator | DB 8 | `redis://localhost:6379/8` |

### Celery Configuration (Standard)

```python
# src/workers/celery_app.py
from celery import Celery
from src.config import settings

celery_app = Celery(
    f"tiktok_{settings.module_name}",
    broker=settings.redis_url,
    backend=settings.redis_url,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=settings.job_timeout_seconds,
    worker_prefetch_multiplier=1,
)
```

### Async/Sync Bridge Pattern

```python
# For running async code in Celery tasks
import asyncio

def run_async(coro):
    """Run async coroutine in sync context (for Celery)."""
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()

@celery_app.task(bind=True)
def process_job(self, job_id: str):
    """Celery task that runs async processing."""
    return run_async(_process_job_async(job_id))
```

---

## AI/LLM Integration

### LLM Provider Abstraction

All modules using LLM capabilities MUST use the provider abstraction pattern:

```python
# src/services/llm_service.py
from abc import ABC, abstractmethod
from typing import Optional, List
from dataclasses import dataclass

@dataclass
class LLMResponse:
    content: str
    model: str
    tokens_used: int

class BaseLLMProvider(ABC):
    """Abstract base class for LLM providers."""

    @abstractmethod
    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = 4096,
    ) -> LLMResponse:
        pass

    @abstractmethod
    async def analyze_with_vision(
        self,
        prompt: str,
        images: List[bytes],
        system_prompt: Optional[str] = None,
    ) -> LLMResponse:
        pass

class AnthropicProvider(BaseLLMProvider):
    """Claude implementation."""
    pass

class OpenAIProvider(BaseLLMProvider):
    """GPT-4 implementation."""
    pass

class LLMService:
    """Service with provider fallback chain."""

    def __init__(self, providers: List[BaseLLMProvider]):
        self.providers = providers

    async def generate(self, prompt: str, **kwargs) -> LLMResponse:
        for provider in self.providers:
            try:
                return await provider.generate_text(prompt, **kwargs)
            except Exception as e:
                continue
        raise Exception("All LLM providers failed")
```

### Supported LLM Providers

| Provider | Model | Primary Use |
|----------|-------|-------------|
| **Anthropic** | claude-sonnet-4-20250514 | Video analysis, strategic insights |
| **OpenAI** | gpt-4o | Fallback, Whisper transcription |
| **Google** | gemini-2.0-flash | Fallback |

---

## DevOps & Infrastructure

### Docker Configuration

All modules MUST provide:
- `Dockerfile` for the API service
- `docker-compose.yml` for local development

### Docker Compose Pattern

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    container_name: tiktok-{module}-api
    ports:
      - "500N:500N"  # Replace N with module number
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/tiktok_{module}
      - REDIS_URL=redis://redis:6379/N
      - API_PORT=500N
    env_file:
      - .env
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy

  worker:
    build: .
    container_name: tiktok-{module}-worker
    command: celery -A src.workers.celery_app worker --loglevel=info
    # ... same env as api

  db:
    image: postgres:15-alpine
    container_name: tiktok-{module}-db
    ports:
      - "5432:5432"
    # ...

  redis:
    image: redis:7-alpine
    container_name: tiktok-{module}-redis
    ports:
      - "6379:6379"
    # ...

  flower:
    build: .
    container_name: tiktok-{module}-flower
    command: celery -A src.workers.celery_app flower --port=555N
    ports:
      - "555N:555N"
    # ...
```

### Environment Variables (Standard)

Every module MUST define these in `.env.example`:

```bash
# Port Configuration (see ../PORTS.md)
VITE_PORT=400N
API_PORT=500N
FLOWER_PORT=555N
WS_PORT=600N

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tiktok_{module}
REDIS_URL=redis://localhost:6379/N

# API Keys
ANTHROPIC_API_KEY=sk-ant-...

# Cross-module Integration
{UPSTREAM}_API_URL=http://localhost:500X
{DOWNSTREAM}_API_URL=http://localhost:500Y
```

---

## Module Compliance Matrix

### Current Status

| Module | Backend | Frontend | Database | Celery | Docker | LLM | Status |
|--------|---------|----------|----------|--------|--------|-----|--------|
| **1. Researcher** | FastAPI | React/Vite | SQLite/PG | Celery | docker-compose | Claude | Backend: COMPLIANT, UI: NOT IMPLEMENTED |
| **2. Clipper** | FastAPI | React/Vite | SQLite/PG | Celery | docker-compose | Claude | COMPLIANT |
| **3. Generator** | - | - | - | - | - | - | NOT IMPLEMENTED |
| **4. Reviewer** | - | - | - | - | - | - | NOT IMPLEMENTED |
| **5. Scheduler** | - | - | - | - | - | - | NOT IMPLEMENTED |
| **6. Publisher** | - | - | - | - | - | - | NOT IMPLEMENTED |
| **7. Monetizer** | - | - | - | - | - | - | NOT IMPLEMENTED |
| **8. Evaluator** | - | - | - | - | - | - | NOT IMPLEMENTED |

### Compliance Checklist Per Module

#### Backend Compliance

- [ ] FastAPI with lifespan context manager
- [ ] Pydantic v2 for all schemas
- [ ] SQLAlchemy 2.x async models
- [ ] Alembic migrations configured
- [ ] Celery worker with async bridge
- [ ] Health check endpoint at `/api/v1/health`
- [ ] CORS configured for frontend port
- [ ] Structured logging with structlog
- [ ] Environment config via pydantic-settings

#### Frontend Compliance

- [ ] React 18+ with TypeScript
- [ ] Vite 5+ as build tool
- [ ] TailwindCSS for styling
- [ ] React Router v6 for routing
- [ ] React Query for server state
- [ ] Axios with configured base URL
- [ ] Path aliases configured (`@/`)
- [ ] Proxy to backend API configured

#### Infrastructure Compliance

- [ ] docker-compose.yml present
- [ ] Dockerfile present
- [ ] .env.example with all required vars
- [ ] Port configuration per PORTS.md
- [ ] Redis DB isolation per module
- [ ] Job linkage with origin_job_id

---

## Implementation Patterns

### API Response Pattern

```python
# Standard success response
{
    "success": true,
    "data": { ... },
    "meta": {
        "page": 1,
        "per_page": 20,
        "total": 100
    }
}

# Standard error response
{
    "success": false,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Invalid input",
        "details": [ ... ]
    }
}
```

### Job Status Flow

All modules MUST use consistent job statuses:

```
pending → processing → completed
                    ↘ failed
                    ↘ cancelled
```

### Cross-Module Communication

Modules communicate via REST API calls:

```python
# src/services/integration.py
import httpx
from src.config import settings

class DownstreamIntegration:
    """Service for communicating with downstream module."""

    def __init__(self):
        self.base_url = settings.downstream_api_url

    async def send_to_next_module(self, job_id: str, data: dict):
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/api/v1/jobs",
                json={
                    "parent_job_id": job_id,
                    "origin_job_id": data.get("origin_job_id"),
                    **data
                }
            )
            return response.json()
```

---

## Migration Guidelines

### Adding a New Module

1. **Copy Structure**: Use Module 2 (Clipper) as template
2. **Update Ports**: Assign ports per PORTS.md
3. **Configure Database**: Create database name, Redis DB number
4. **Update Cross-Module URLs**: Add upstream/downstream API URLs
5. **Implement Job Linkage**: Include parent_job_id, origin_job_id
6. **Create UI**: Follow frontend structure from Module 2
7. **Update Compliance Matrix**: Mark status in this document

### Upgrading Existing Module

1. **Check Compliance Matrix**: Identify missing requirements
2. **Add Missing Dependencies**: Update requirements.txt/package.json
3. **Refactor to Patterns**: Align with standard patterns above
4. **Test Integration**: Verify cross-module communication
5. **Update Documentation**: Update module CLAUDE.md

---

## Related Documentation

- [PORTS.md](PORTS.md) - Port allocation guide
- [CLAUDE.md](CLAUDE.md) - Platform architecture overview
- Module-specific CLAUDE.md files for implementation details

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-12-03 | Initial standardization guide |
