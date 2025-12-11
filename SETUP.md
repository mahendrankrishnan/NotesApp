# Setup Guide

## Prerequisites

1. **Node.js** (>= 18.0.0)
2. **PNPM** (>= 8.0.0) - Install with `npm install -g pnpm`
3. **PostgreSQL** - Make sure PostgreSQL is installed and running

## Installation Steps

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Database

Create a PostgreSQL database:

```sql
CREATE DATABASE notesdb;
```

### 3. Configure Environment Variables

#### Backend

Create `backend/.env` file:

```env
DATABASE_URL=
PORT=4202
```

Replace `username` and `password` with your PostgreSQL credentials.

#### Frontend

Create `frontend/.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:4202
```

### 4. Run Database Migrations

```bash
cd backend
pnpm db:generate
pnpm db:migrate
```

This will:
- Generate migration files from the schema
- Apply migrations to your database

### 5. Start Development Servers

From the root directory:

```bash
pnpm dev
```

This will start:
- **Frontend**: http://localhost:4203
- **Backend**: http://localhost:4202

## Available Scripts

### Root Level

- `pnpm dev` - Start both frontend and backend in development mode
- `pnpm build` - Build both frontend and backend for production
- `pnpm start` - Start both frontend and backend in production mode

### Backend

- `pnpm dev` - Start backend server with hot reload
- `pnpm build` - Build TypeScript to JavaScript
- `pnpm start` - Start production server
- `pnpm db:generate` - Generate database migrations
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Drizzle Studio (database GUI)

### Frontend

- `pnpm dev` - Start Next.js development server
- `pnpm build` - Build Next.js application
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `pg_isready` or check your PostgreSQL service
- Check your `DATABASE_URL` format: `postgresql://user:password@host:port/database`
- Ensure the database exists: `psql -l` to list databases

### Port Already in Use

- Change the `PORT` in `backend/.env` if 4202 is taken
- Change Next.js port: `pnpm --filter frontend dev -- -p 4204`

### Migration Issues

- Make sure you've run `pnpm db:generate` before `pnpm db:migrate`
- Check that your database connection string is correct
- Verify the database exists and you have proper permissions

