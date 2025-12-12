#!/bin/bash

cd "$(dirname "$0")/backend"

echo "🚀 Starting Backend Server..."
echo "📦 Installing dependencies (if needed)..."
npm install

echo "🗄️  Setting up database..."
npx prisma generate
npx prisma migrate dev --name init || echo "Migration may already exist"
npm run prisma:seed || echo "Seed may have already run"

echo "🔧 Starting backend on http://localhost:3001"
npm run dev

