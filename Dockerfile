# Build stage for React frontend
FROM node:22-alpine AS frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage for FastAPI backend
FROM python:3.10-slim
WORKDIR /app

# Non-root user setup (NFR-3)
RUN useradd -m appuser
RUN chown -R appuser:appuser /app

# Install backend dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Ensure email-validator is installed
RUN pip install --no-cache-dir pydantic[email] bcrypt==4.0.1

# Copy backend code
COPY backend/ ./

# Copy built frontend assets
COPY --from=frontend-build /app/dist ./dist

# Switch to non-root user
USER appuser

# Expose port (Cloud Run defaults to 8080)
EXPOSE 8080

# Run FastAPI via Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
