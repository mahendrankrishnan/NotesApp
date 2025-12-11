# Docker Deployment Guide

This guide explains how to deploy the Notes Application using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10 or later
- Docker Compose 2.0 or later

## Quick Start

### 1. Build and Start All Services

```bash
docker-compose up -d
```

This will:
- Build the frontend and backend Docker images
- Start PostgreSQL database
- Start the backend API server (runs migrations automatically)
- Start the frontend Next.js application

### 2. Access the Application

- **Frontend**: http://localhost:4203
- **Backend API**: http://localhost:4202
- **PostgreSQL**: localhost:5436

### 3. View Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### 4. Stop Services

```bash
# Stop all services (keeps data)
docker-compose down

# Stop and remove volumes (deletes database data)
docker-compose down -v
```

## Services

### PostgreSQL Database

- **Image**: `postgres:16-alpine`
- **Port**: `5436` (external), `5432` (internal container port)
- **Database**: `notesdb`
- **User**: `notesuser`
- **Password**: `notespassword`
- **Volume**: `postgres_data` (persists data)

### Backend API

- **Port**: `4202`
- **Auto-migrates** database on startup
- **Health check**: Available at `/health`

### Frontend

- **Port**: `4203`
- **Built** Next.js production bundle

## Environment Variables

The `docker-compose.yml` file is already configured to use environment variables from a `.env` file. 

1. Copy the example file:
```bash
cp env.example .env
```

2. Edit `.env` with your values:

```env
# PostgreSQL Database Configuration
POSTGRES_USER=notesuser
POSTGRES_PASSWORD=notespassword
POSTGRES_DB=notesdb

# Database Connection URL
# Use 'postgres' as hostname (Docker service name, not 'localhost')
DATABASE_URL=postgresql://notesuser:notespassword@postgres:5432/notesdb

# Application Ports
BACKEND_PORT=4202
FRONTEND_PORT=4203

# Frontend API URL
NEXT_PUBLIC_API_URL=http://localhost:4202
```
**Important Notes:**
- The `DATABASE_URL` must use `postgres` as the hostname (the Docker service name) for internal container communication
- For `NEXT_PUBLIC_API_URL`, use `localhost` since this is accessed from your browser
- All variables have default values, so `.env` is optional but recommended for customization

## Development with Docker

For development, you can use `docker-compose.dev.yml` to run only the database:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

This starts only PostgreSQL, allowing you to run frontend and backend locally while using the containerized database.

## Building Images Separately

### Build Backend

```bash
docker build -f backend/Dockerfile -t notes-backend .
```

### Build Frontend

```bash
docker build -f frontend/Dockerfile -t notes-frontend .
```

## Troubleshooting

### Port Already in Use

If ports 4203, 4202, or 5436 are already in use, you can change them in `docker-compose.yml`:

```yaml
ports:
  - "4204:4203"  # Change host port
```

### Database Connection Issues

1. Check if PostgreSQL is healthy:
```bash
docker-compose ps
```

2. Check database logs:
```bash
docker-compose logs postgres
```

3. Verify DATABASE_URL in backend container:
```bash
docker-compose exec backend env | grep DATABASE_URL
```

### Rebuild After Code Changes

```bash
# Rebuild and restart
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build backend
```

### Reset Database

```bash
# Stop and remove volumes
docker-compose down -v

# Start again (will create fresh database)
docker-compose up -d
```

### View Container Shell

```bash
# Backend
docker-compose exec backend sh

# Frontend
docker-compose exec frontend sh

# Database
docker-compose exec postgres psql -U notesuser -d notesdb
```

## Production Considerations

For production deployment:

1. **Change default passwords** in `docker-compose.yml`
2. **Use environment variables** for sensitive data
3. **Set up proper networking** (reverse proxy, load balancer)
4. **Enable SSL/TLS** for database connections
5. **Configure backups** for PostgreSQL volumes
6. **Set resource limits** for containers
7. **Use Docker secrets** for sensitive information
8. **Configure health checks** and restart policies
9. **Set up monitoring** and logging
10. **Use multi-stage builds** (already implemented)

## Docker Compose Commands Reference

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart a service
docker-compose restart backend

# Scale services (if needed)
docker-compose up -d --scale backend=2

# Execute command in container
docker-compose exec backend pnpm db:migrate

# View running containers
docker-compose ps

# Remove everything including volumes
docker-compose down -v --rmi all
```

