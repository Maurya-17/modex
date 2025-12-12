# 🚀 Start Here - Running the Application

## Quick Start (Recommended)

### If you have Node.js installed:

```bash
./run.sh
```

This script will:
- Check for Node.js and npm
- Optionally start PostgreSQL/Redis with Docker
- Install dependencies
- Set up the database
- Start both backend and frontend

## Manual Start (Step by Step)

### Prerequisites
- Node.js 18+ installed
- PostgreSQL running (or Docker)
- Redis running (or Docker)

### Step 1: Start Database Services (if using Docker)

```bash
docker compose up -d postgres redis
```

Wait 10 seconds for services to be ready.

### Step 2: Backend Setup & Start

**Terminal 1:**
```bash
cd backend

# Install dependencies (first time only)
npm install

# Set up database (first time only)
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed

# Start backend
npm run dev
```

Backend will run on: **http://localhost:3001**

### Step 3: Frontend Setup & Start

**Terminal 2 (new terminal):**
```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start frontend
npm run dev
```

Frontend will run on: **http://localhost:5173**

## Access Points

Once running:
- 🌐 **Frontend**: http://localhost:5173
- 🔧 **Backend API**: http://localhost:3001
- 📚 **API Documentation**: http://localhost:3001/api-docs
- ❤️ **Health Check**: http://localhost:3001/api/health

## Troubleshooting

### "command not found: node" or "command not found: npm"

**Install Node.js:**
1. Download from https://nodejs.org/ (LTS version)
2. Or use Homebrew: `brew install node`
3. Or use nvm: `nvm install 18 && nvm use 18`

**Verify installation:**
```bash
node -v  # Should show v18.x.x or higher
npm -v   # Should show version number
```

### Database Connection Error

**If using Docker:**
```bash
docker compose ps  # Check if services are running
docker compose logs postgres  # Check logs
```

**If using local PostgreSQL:**
1. Ensure PostgreSQL is running: `pg_isready`
2. Create database: `createdb modex`
3. Update `backend/.env` with correct credentials

### Redis Connection Error

**If using Docker:**
```bash
docker compose ps  # Check if Redis is running
```

**If using local Redis:**
```bash
redis-cli ping  # Should return PONG
```

### Port Already in Use

Change ports in:
- Backend: `backend/.env` → `PORT=3001`
- Frontend: `frontend/vite.config.ts` → `server.port`

## Need Help?

See detailed guides:
- `QUICK_START.md` - Detailed setup instructions
- `README.md` - Complete documentation
- `SETUP.md` - Setup troubleshooting

