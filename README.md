# Notes Application

A full-stack notes application built with Next.js (frontend) and Fastify (backend), using PostgreSQL and Drizzle ORM. Added to view real-time application logs from Kafka. Kafka Event Logging



## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Backend**: Fastify with Node.js and TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Event Logging**: Apache Kafka with KafkaJS
- **Package Manager**: PNPM

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Notes Application                            │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│   Frontend       │
│   (Next.js)      │  Port: 4203
│   Port: 4203     │
│                  │
│  Features:       │
│  • Note CRUD     │
│  • Search/Filter │
│  • Logs Viewer   │
└────────┬─────────┘
         │ HTTP/REST API
         │ (GET, POST, PUT, DELETE)
         │
         ▼
┌──────────────────┐
│   Backend        │
│   (Fastify)      │  Port: 4202
│   Port: 4202     │
│                  │
│  Features:       │
│  • REST API      │
│  • Kafka Logger  │
│  • Log Consumer  │
└────┬─────────┬───┘
     │         │
     │         │
     │         │
     ▼         ▼
┌─────────┐  ┌──────────────────┐
│PostgreSQL│  │   Kafka          │
│         │  │   Port: 9092     │
│ Port:   │  │                  │
│ 5436    │  │  • Event Logging │
│         │  │  • Log Storage   │
│  • Notes│  └────────┬─────────┘
│  • CRUD │           │
└─────────┘           │
                      │
                      ▼
              ┌───────────────┐
              │  Zookeeper    │
              │  Port: 2181   │
              │               │
              │  • Coordination│
              └───────────────┘

Data Flow:
1. User interacts with Frontend (create, read, update, delete notes, search/filter)
2. Frontend sends HTTP requests to Backend API
3. Backend processes requests and interacts with PostgreSQL
4. Backend logs all events (API calls, DB queries, errors) to Kafka
5. Frontend can fetch logs from Backend's Log Consumer service
6. Kafka stores events, Zookeeper manages Kafka coordination
```

## Project Structure

```
.
├── frontend/          # Next.js application
├── backend/           # Fastify API server
└── package.json       # Root package.json with workspaces
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- PNPM >= 8.0.0
- PostgreSQL database

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:

Create `.env` in the backend directory:
```
DATABASE_URL=postgresql://user:password@localhost:5436/notesdb
PORT=4202
```

Create `.env.local` in the frontend directory:
```
NEXT_PUBLIC_API_URL=http://localhost:4202
```

3. Run database migrations:
```bash
cd backend
pnpm db:generate
pnpm db:migrate
```

4. Start development servers:
```bash
pnpm dev
```

The frontend will be available at http://localhost:4203
The backend API will be available at http://localhost:4202

## API Documentation

The backend API includes comprehensive Swagger/OpenAPI documentation with schema validation.

### Accessing Swagger UI

Once the backend server is running, you can access the interactive API documentation at:

**http://localhost:4202/docs**

The Swagger UI provides:
- Complete API endpoint documentation
- Request/response schemas
- Interactive API testing
- Schema validation details

### API Endpoints

#### Notes API (`/notes`)
- `GET /notes` - Get all notes
- `GET /notes/:id` - Get a single note by ID
- `POST /notes` - Create a new note
- `PUT /notes/:id` - Update an existing note
- `DELETE /notes/:id` - Delete a note

#### Logs API (`/api/logs`)
- `GET /api/logs` - Get application logs with optional filtering
- `GET /api/logs/stats` - Get log statistics
- `GET /api/logs/status` - Get Kafka connection status

#### Health Check
- `GET /health` - Health check endpoint

### Schema Validation

All API endpoints include JSON Schema validation for:
- Request parameters
- Request body
- Query parameters
- Response formats

Invalid requests will automatically return `400 Bad Request` with validation error details.

## Scripts

- `pnpm dev` - Start both frontend and backend in development mode
- `pnpm build` - Build both frontend and backend for production
- `pnpm start` - Start both frontend and backend in production mode

## Docker Deployment

### Prerequisites

- Docker and Docker Compose installed

### Quick Start with Docker

1. Build and start all services:
```bash
docker-compose up -d
```

2. View logs:
```bash
docker-compose logs -f
```

3. Stop all services:
```bash
docker-compose down
```

4. Stop and remove volumes (database data):
```bash
docker-compose down -v
```

The application will be available at:
- **Frontend**: http://localhost:4203
- **Backend API**: http://localhost:4202
- **API Documentation (Swagger)**: http://localhost:4202/docs
- **PostgreSQL**: localhost:5436
- **Kafka**: localhost:9092

### View Logs in UI

Navigate to **http://localhost:4203/logs** to view real-time application logs from Kafka.

### Docker Services

- `zookeeper` - Zookeeper for Kafka coordination
- `kafka` - Apache Kafka for event logging
- `postgres` - PostgreSQL database
- `backend` - Fastify API server (runs migrations on startup)
- `frontend` - Next.js application

### Environment Variables

You can customize the setup by creating a `.env` file in the root directory. Copy `env.example` to `.env` and modify as needed:

```bash
cp env.example .env
```

Example `.env` file:

```env
# PostgreSQL Database Configuration
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=

# Database Connection URL
# Use 'postgres' as hostname (Docker service name, not 'localhost')
DATABASE_URL=

# Application Ports
BACKEND_PORT=
FRONTEND_PORT=

# Frontend API URL
NEXT_PUBLIC_API_URL=http://localhost:4202

# Kafka Configuration
KAFKA_ENABLED=true
KAFKA_BROKERS=
KAFKA_CLIENT_ID=
KAFKA_LOG_TOPIC=
SERVICE_NAME=
```

**Important**: 
- The `DATABASE_URL` in docker-compose should use `postgres` as the hostname (not `localhost`) since services communicate via Docker's internal network.
- The `KAFKA_BROKERS` should use `kafka:29092` for internal Docker communication.

## Kafka Event Logging

The application includes Kafka-based event logging for:
- API requests and responses
- Database queries and errors
- System events

See `backend/KAFKA_LOGGING.md` for detailed documentation on the logging system.

