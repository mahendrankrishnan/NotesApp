# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace configuration
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml* ./

COPY frontend/package.json ./frontend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy frontend source code
COPY frontend ./frontend

# Build the Next.js application
WORKDIR /app/frontend
# Create public directory if it doesn't exist (Next.js requires it)
RUN mkdir -p public
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

# Copy frontend package.json
COPY frontend/package.json ./frontend/

# Install production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built application from builder
COPY --from=builder /app/frontend/.next ./frontend/.next
COPY --from=builder /app/frontend/public ./frontend/public
COPY --from=builder /app/frontend/next.config.js ./frontend/next.config.js
COPY --from=builder /app/frontend/package.json ./frontend/package.json
COPY --from=builder /app/frontend/tsconfig.json ./frontend/tsconfig.json
COPY --from=builder /app/frontend/app ./frontend/app
COPY --from=builder /app/frontend/components ./frontend/components
COPY --from=builder /app/frontend/types ./frontend/types

WORKDIR /app/frontend

EXPOSE 4203

ENV NODE_ENV=production
ENV PORT=4203

CMD ["pnpm", "start"]

