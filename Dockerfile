# ---------- FRONTEND (React + Vite) ----------
     FROM node:20-alpine AS frontend
     
     WORKDIR /app/frontend
     COPY frontend/ .
     
     RUN npm install && npm run build
     
     
     # ---------- BACKEND (FastAPI + Uvicorn) ----------
     FROM python:3.11-slim AS backend
     
     # Set workdir
     WORKDIR /app
     
     # Copy backend code
     COPY backend/ /app/backend
     
     # Copy frontend build into backend's static directory
     COPY --from=frontend /app/frontend/dist /app/backend/static
     
     # Install Python dependencies
     RUN pip install --upgrade pip \
      && pip install -r /app/backend/requirements.txt
     
     # Expose the backend port
     EXPOSE 8000
     
     # Start FastAPI backend with Uvicorn
     CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
     