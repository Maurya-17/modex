# Quick Start Guide

## Prerequisites Check

Before running, ensure you have:
- Node.js 18+ installed
- npm installed
- PostgreSQL running (or Docker for PostgreSQL + Redis)

## Option 1: Using Docker (Easiest)

### Step 1: Start Database Services
```bash
cd /Users/shashankbhoga/Desktop/modex
docker compose up -d postgres redis
```

Wait 10-15 seconds for services to be ready.

### Step 2: Set Up Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

### Step 3: Start Backend (Terminal 1)
```bash
npm run dev
```

Backend will run on http://localhost:3001

### Step 4: Start Frontend (Terminal 2 - New Terminal)
```bash
cd /Users/shashankbhoga/Desktop/modex/frontend
npm install
npm run dev
```

Frontend will run on http://localhost:5173

## Option 2: Manual Setup (Without Docker)

### Step 1: Set Up PostgreSQL
Create a database:
```sql
CREATE DATABASE modex;
```

Update `backend/.env`:
```
DATABASE_URL="postgresql://username:password@localhost:5432/modex?schema=public"
REDIS_URL="redis://localhost:6379"
```

### Step 2: Start Redis
```bash
# macOS with Homebrew:
brew services start redis

# Or using Docker:
docker run -d -p 6379:6379 redis:7-alpine
```

### Step 3: Set Up Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

### Step 4: Start Frontend (New Terminal)
```bash
cd frontend
npm install
npm run dev
```

## Access the Application

Once both services are running:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Docs (Swagger)**: http://localhost:3001/api-docs
- **Health Check**: http://localhost:3001/api/health

## Troubleshooting

### "npm: command not found"
- Install Node.js from https://nodejs.org/
- Or use nvm: `nvm install 18 && nvm use 18`

### Database Connection Error
- Ensure PostgreSQL is running
- Check DATABASE_URL in `backend/.env`
- Verify database exists: `psql -l | grep modex`

### Redis Connection Error
- Ensure Redis is running: `redis-cli ping`
- Check REDIS_URL in `backend/.env`

### Port Already in Use
- Backend uses port 3001
- Frontend uses port 5173
- Change ports in `.env` files if needed

## Using the Startup Scripts

If Node.js is in your PATH, you can use:

```bash
# Terminal 1 - Backend
./start-backend.sh

# Terminal 2 - Frontend  
./start-frontend.sh
```

