# 🎭 Modex Ticket Booking System - Project Status

## ✅ Connection Status

### Database ↔ Backend
- **Status**: ✅ Connected
- **Database**: PostgreSQL (modex)
- **Connection**: `postgresql://shashankbhoga@localhost:5432/modex`
- **Migrations**: Applied
- **Seed Data**: Loaded (Admin & User accounts)

### Backend ↔ Frontend
- **Status**: ✅ Connected
- **Backend URL**: http://localhost:3001
- **Frontend URL**: http://localhost:5173
- **API Proxy**: Configured in Vite
- **CORS**: Enabled on backend

### Redis ↔ Backend
- **Status**: ✅ Connected
- **Redis URL**: `redis://localhost:6379`
- **Purpose**: Booking expiry queue (Bull)

## 🌐 Access Points

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | http://localhost:5173 | ✅ Running |
| **Backend API** | http://localhost:3001 | ✅ Running |
| **API Docs** | http://localhost:3001/api-docs | ✅ Available |
| **Health Check** | http://localhost:3001/api/health | ✅ Healthy |

## 🔗 Connection Flow

```
User Browser
    ↓
Frontend (React) - http://localhost:5173
    ↓ (API calls via proxy)
Backend (Express) - http://localhost:3001
    ↓
PostgreSQL Database - localhost:5432
    ↓
Redis Queue - localhost:6379
```

## 📊 Current Configuration

### Frontend Configuration
- **API Base URL**: `http://localhost:3001` (default)
- **Proxy**: `/api` → `http://localhost:3001`
- **Environment**: Development mode

### Backend Configuration
- **Port**: 3001
- **Database**: PostgreSQL (modex)
- **Redis**: localhost:6379
- **CORS**: Enabled for all origins
- **Booking Expiry**: 2 minutes

## 🧪 Test the Connection

### 1. Health Check
```bash
curl http://localhost:3001/api/health
```

### 2. Get Shows
```bash
curl http://localhost:3001/api/shows
```

### 3. Create a Show (Admin)
```bash
curl -X POST http://localhost:3001/api/admin/shows \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Concert Night",
    "startTime": "2024-12-31T20:00:00Z",
    "totalSeats": 100
  }'
```

### 4. Access Frontend
Open http://localhost:5173 in your browser

## 🎯 Next Steps

1. **Open Frontend**: Navigate to http://localhost:5173
2. **Create Shows**: Use the admin endpoint or API docs
3. **Book Seats**: Use the frontend interface
4. **View Bookings**: Check booking status and confirmations

## 🔧 Troubleshooting

### Frontend can't connect to backend
- Check backend is running: `lsof -ti:3001`
- Check CORS is enabled in backend
- Verify API proxy in `frontend/vite.config.ts`

### Database connection issues
- Check PostgreSQL is running: `brew services list | grep postgresql`
- Verify database exists: `psql -l | grep modex`
- Check `.env` file has correct DATABASE_URL

### Redis connection issues
- Check Redis is running: `brew services list | grep redis`
- Test connection: `redis-cli ping`

## 📝 Notes

- All services are configured and running
- Database is seeded with test users
- Frontend is connected to backend via API proxy
- Booking expiry is active (2-minute timeout)
- Concurrency control is enabled (row-level locks)

