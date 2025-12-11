# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace configuration
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml* ./

# Copy backend package.json
COPY backend/package.json ./backend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy backend source code
COPY backend ./backend

# Build the application
WORKDIR /app/backend
# Ensure drizzle directory structure exists
RUN mkdir -p drizzle/meta
# Generate migrations (creates drizzle directory with migration files)
# This doesn't require a database connection, just reads the schema
RUN pnpm db:generate || echo "Migration generation completed or skipped"
RUN pnpm build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace configuration
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml* ./

# Copy backend package.json
COPY backend/package.json ./backend/

# Install production dependencies (including tsx for migrations)
RUN pnpm install --frozen-lockfile

# Copy built application and necessary files from builder
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/src/db/schema.ts ./backend/src/db/schema.ts
COPY --from=builder /app/backend/drizzle.config.ts ./backend/drizzle.config.ts
COPY --from=builder /app/backend/tsconfig.json ./backend/tsconfig.json
COPY --from=builder /app/backend/src/db/migrate.ts ./backend/src/db/migrate.ts
# Copy drizzle directory (migrations) - directory structure is guaranteed to exist
COPY --from=builder /app/backend/drizzle ./backend/drizzle

WORKDIR /app/backend

EXPOSE 4202

CMD ["pnpm", "start"]

