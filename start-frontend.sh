#!/bin/bash

cd "$(dirname "$0")/frontend"

echo "🚀 Starting Frontend Server..."
echo "📦 Installing dependencies (if needed)..."
npm install

echo "🎨 Starting frontend on http://localhost:5173"
npm run dev

