# Quick Setup Guide

## Prerequisites

1. **Node.js 18+** and npm installed
2. **PostgreSQL 13+** running (or use Docker)
3. **Redis** running (or use Docker)

## Option 1: Using Docker (Easiest)

```bash
# Start PostgreSQL and Redis
docker compose up -d postgres redis

# Wait a few seconds for services to be ready, then:
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run dev

# In another terminal:
cd frontend
npm install
npm run dev
```

## Option 2: Manual Setup

### 1. Set up PostgreSQL

Create a database:
```sql
CREATE DATABASE modex;
```

Update `backend/.env` with your database URL:
```
DATABASE_URL="postgresql://username:password@localhost:5432/modex?schema=public"
```

### 2. Set up Redis

Install and start Redis, or use Docker:
```bash
docker run -d -p 6379:6379 redis:7-alpine
```

### 3. Start Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

### 4. Start Frontend

In a new terminal:
```bash
cd frontend
npm install
npm run dev
```

## Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## Using the Startup Scripts

You can also use the provided scripts:

```bash
# Start backend only
./start-backend.sh

# Start frontend only (in another terminal)
./start-frontend.sh

# Start both (if your system supports it)
./start-all.sh
```

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running: `pg_isready` or check Docker containers
- Verify DATABASE_URL in `backend/.env`

### Redis Connection Error
- Ensure Redis is running: `redis-cli ping` or check Docker containers
- Verify REDIS_URL in `backend/.env`

### Port Already in Use
- Backend uses port 3001
- Frontend uses port 5173
- Change ports in `.env` files if needed

