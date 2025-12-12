#!/bin/bash

# Modex Ticket Booking System - Startup Script
# This script helps you start both backend and frontend

echo "🎭 Modex Ticket Booking System"
echo "================================"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found!"
    echo ""
    echo "Please install Node.js 18+ from:"
    echo "  https://nodejs.org/"
    echo ""
    echo "Or if you use nvm:"
    echo "  nvm install 18"
    echo "  nvm use 18"
    echo ""
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) found"
echo ""

# Check for npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found!"
    exit 1
fi

echo "✅ npm $(npm -v) found"
echo ""

# Check for Docker (optional)
if command -v docker &> /dev/null; then
    echo "✅ Docker found"
    echo ""
    read -p "Do you want to start PostgreSQL and Redis with Docker? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🐳 Starting PostgreSQL and Redis..."
        docker compose up -d postgres redis
        echo "⏳ Waiting for services to be ready..."
        sleep 5
    fi
else
    echo "⚠️  Docker not found. Make sure PostgreSQL and Redis are running manually."
    echo ""
fi

# Backend setup
echo "📦 Setting up backend..."
cd backend

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

if [ ! -f "prisma/migrations" ] || [ -z "$(ls -A prisma/migrations 2>/dev/null)" ]; then
    echo "🗄️  Setting up database..."
    npx prisma generate
    npx prisma migrate dev --name init || echo "Migration may already exist"
    npm run prisma:seed || echo "Seed may have already run"
fi

echo ""
echo "🚀 Starting backend on http://localhost:3001"
echo "   API Docs: http://localhost:3001/api-docs"
echo ""
npm run dev &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Frontend setup
echo ""
echo "📦 Setting up frontend..."
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

echo ""
echo "🎨 Starting frontend on http://localhost:5173"
echo ""
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Services started!"
echo ""
echo "   Backend:  http://localhost:3001"
echo "   Frontend: http://localhost:5173"
echo "   API Docs: http://localhost:3001/api-docs"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for user interrupt
trap "echo ''; echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait

