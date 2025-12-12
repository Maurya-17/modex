# Modex Full-Stack Ticket Booking System

A production-ready ticket booking system with concurrency control, booking expiry, and a modern React frontend.

## 🏗️ Architecture

- **Backend**: Node.js + TypeScript + Express + Prisma + PostgreSQL
- **Frontend**: React + TypeScript + Vite
- **Queue**: Redis + Bull for booking expiry
- **Database**: PostgreSQL with row-level locking for concurrency control

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose (for local development)
- PostgreSQL 13+ (if running without Docker)
- Redis (if running without Docker)

### Option 1: Docker Compose (Recommended)

1. Clone the repository and navigate to the project directory.

2. Start all services:
```bash
docker-compose up -d
```

3. Set up the database:
```bash
# Run migrations
docker-compose exec backend npx prisma migrate dev

# Seed initial data
docker-compose exec backend npm run prisma:seed
```

4. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - API Health: http://localhost:3001/api/health
   - API Documentation (Swagger): http://localhost:3001/api-docs

### Option 2: Manual Setup

#### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database and Redis URLs
```

4. Set up the database:
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed initial data
npm run prisma:seed
```

5. Start the backend:
```bash
npm run dev
```

#### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (optional):
```bash
# Create .env file if you need to override the default API URL
echo "VITE_API_BASE_URL=http://localhost:3001" > .env
```

4. Start the frontend:
```bash
npm run dev
```

## 📚 API Documentation

### Swagger/OpenAPI
- Interactive API documentation available at: http://localhost:3001/api-docs
- Full OpenAPI 3.0 specification with all endpoints documented

### Postman Collection
- Import `backend/postman_collection.json` into Postman
- Collection includes all endpoints with example requests
- Base URL variable: `{{baseUrl}}` (default: http://localhost:3001)

### Base URL
- Local: `http://localhost:3001/api`

### Endpoints

#### Admin Endpoints

**POST /api/admin/shows**
- Create a new show with seats
- Body: `{ title: string, startTime: string (ISO), totalSeats: number }`
- Example:
```bash
curl -X POST http://localhost:3001/api/admin/shows \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Concert Night",
    "startTime": "2024-12-31T20:00:00Z",
    "totalSeats": 100
  }'
```

#### User Endpoints

**GET /api/shows**
- Get all available shows

**GET /api/shows/:id/seats**
- Get seat availability for a show

**POST /api/shows/:id/book**
- Create a booking (holds seats)
- Body: `{ userId: string, seats: number[] }`
- Returns: `{ bookingId: string, status: "PENDING", seats: number[] }`

**GET /api/bookings/:id**
- Get booking details

**POST /api/bookings/:id/confirm**
- Confirm a pending booking (simulates payment)

**DELETE /api/bookings/:id/cancel**
- Cancel a booking and release seats

**GET /api/health**
- Health check endpoint

## 🔒 Concurrency Control

The system uses PostgreSQL row-level locks (`SELECT ... FOR UPDATE`) to prevent overbooking:

1. When booking seats, the system locks the requested seats within a transaction
2. It validates that all seats are `AVAILABLE`
3. If any seat is unavailable, it returns HTTP 409 (Conflict)
4. Seats are marked as `HELD` and linked to the booking

## ⏰ Booking Expiry

Pending bookings automatically expire after 2 minutes (configurable via `BOOKING_EXPIRY_MINUTES`):

- Uses Redis + Bull queue to schedule expiry jobs
- When a booking expires, seats are released back to `AVAILABLE`
- Booking status is set to `FAILED`

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
```

The test suite includes:
- API endpoint tests
- Concurrency tests (preventing double booking)
- Input validation tests
- Error handling tests

### Test Coverage

```bash
npm run test:coverage
```

## 📦 Deployment

### Backend (Railway/Render)

1. Set environment variables:
   - `DATABASE_URL`
   - `REDIS_URL`
   - `PORT`
   - `NODE_ENV=production`
   - `BOOKING_EXPIRY_MINUTES`

2. Build and deploy:
```bash
npm run build
npm start
```

### Frontend (Vercel/Netlify)

1. Set environment variable:
   - `VITE_API_BASE_URL` (your backend URL)

2. Build:
```bash
npm run build
```

3. Deploy the `dist` folder

## 🗄️ Database Schema

- **User**: Users with roles (ADMIN, USER)
- **Show**: Events with start time and total seats
- **Seat**: Individual seats with status (AVAILABLE, HELD, BOOKED)
- **Booking**: Bookings with status (PENDING, CONFIRMED, FAILED)

See `backend/prisma/schema.prisma` for full schema.

## 🔧 Environment Variables

### Backend

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)
- `BOOKING_EXPIRY_MINUTES`: Booking expiry time (default: 2)

### Frontend

- `VITE_API_BASE_URL`: Backend API URL (default: http://localhost:3001)

## 📝 Notes

- The booking expiry uses Bull queue with Redis. For production, ensure Redis is properly configured.
- Row-level locking ensures no overbooking even under high concurrency.
- The frontend polls booking status every 2 seconds for pending bookings.
- Default test users are seeded: Admin (ID: 00000000-0000-0000-0000-000000000001) and User (ID: 00000000-0000-0000-0000-000000000002)

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running and accessible
- Check `DATABASE_URL` in `.env`

### Redis Connection Issues
- Ensure Redis is running
- Check `REDIS_URL` in `.env`

### Port Conflicts
- Backend default: 3001
- Frontend default: 5173
- PostgreSQL default: 5432
- Redis default: 6379

## 📄 License

ISC

