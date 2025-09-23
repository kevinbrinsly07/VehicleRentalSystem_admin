#!/bin/bash

# Exit immediately if a command fails
set -e

echo "🚀 Starting full-stack app (FastAPI + React + Vite + SQLite)..."

# 1. Start backend (FastAPI)
echo "🔧 Setting up FastAPI backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# Activate venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Start FastAPI backend (on port 8000)
uvicorn main:app --host 0.0.0.0 --port 8000 &

cd ..

# 2. Build frontend (React + Vite)
echo "🔧 Building React + Vite frontend..."
cd frontend
npm install
npm run build

# Serve the static files (on port 3000)
npx serve -s dist -l 3000
