#!/bin/bash

# Start backend and frontend in separate terminal windows/tabs
# This script opens them in new terminal windows (macOS)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Make scripts executable
chmod +x "$SCRIPT_DIR/start-backend.sh"
chmod +x "$SCRIPT_DIR/start-frontend.sh"

echo "🚀 Starting Modex Ticket Booking System..."
echo ""
echo "📋 Prerequisites:"
echo "   - PostgreSQL running on localhost:5432"
echo "   - Redis running on localhost:6379"
echo "   - Database 'modex' created"
echo ""
echo "💡 Tip: If using Docker, run: docker compose up -d postgres redis"
echo ""

# Start backend in background
echo "🔧 Starting backend..."
cd "$SCRIPT_DIR/backend"
npm install > /dev/null 2>&1
npx prisma generate > /dev/null 2>&1
npm run dev &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend..."
cd "$SCRIPT_DIR/frontend"
npm install > /dev/null 2>&1
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Services started!"
echo "   Backend:  http://localhost:3001"
echo "   Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait

