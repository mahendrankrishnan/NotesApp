# Kafka Logging Implementation

This document describes the Kafka-based event logging system implemented in the Notes Application backend.

## Overview

The application uses Kafka to send structured log events for:
- API requests and responses
- Database queries and errors
- System events
- Application errors

## Architecture

### Components

1. **Kafka Service** (`src/services/kafka.ts`)
   - Manages Kafka producer connection
   - Handles message sending to Kafka topics
   - Gracefully handles connection failures

2. **Logger Service** (`src/services/logger.ts`)
   - Provides high-level logging interface
   - Formats events according to defined types
   - Sends events to Kafka via Kafka Service

3. **Event Types** (`src/types/events.ts`)
   - Defines structured event schemas
   - Type-safe event definitions
   - Supports multiple event categories

## Event Types

### API Events
- `API_REQUEST` - Incoming HTTP requests
- `API_RESPONSE` - HTTP responses with status codes and timing
- `API_ERROR` - API errors with stack traces

### Database Events
- `DATABASE_QUERY` - Database operations with timing
- `DATABASE_ERROR` - Database errors

### System Events
- `SYSTEM` - Server startup, shutdown, and system-level events

## Configuration

### Environment Variables

```env
# Enable/disable Kafka logging
KAFKA_ENABLED=true

# Kafka broker addresses (comma-separated)
KAFKA_BROKERS=kafka:29092

# Kafka client ID
KAFKA_CLIENT_ID=notes-app-backend

# Kafka topic for logs
KAFKA_LOG_TOPIC=application-logs

# Service name for log identification
SERVICE_NAME=notes-app-backend
```

### Docker Compose

Kafka and Zookeeper are included in `docker-compose.yml`:
- **Zookeeper**: Port 2181 (internal)
- **Kafka**: Port 9092 (external), 29092 (internal)

## Usage

### Basic Logging

```typescript
import { logger, EventType } from './services/logger.js';

// Info log
await logger.info(EventType.SYSTEM, 'Operation completed', { userId: 123 });

// Error log
await logger.error(EventType.DATABASE_ERROR, 'Query failed', { 
  query: 'SELECT * FROM notes',
  error: error.message 
});

// Warning log
await logger.warn(EventType.API_REQUEST, 'Rate limit approaching', { 
  requests: 95,
  limit: 100 
});
```

### Specialized Logging Methods

```typescript
// API Request
await logger.logApiRequest({
  timestamp: new Date().toISOString(),
  level: 'info',
  eventType: EventType.API_REQUEST,
  service: 'notes-app-backend',
  message: 'Incoming GET request',
  metadata: {
    method: 'GET',
    path: '/notes',
    ip: '192.168.1.1',
    userAgent: 'Mozilla/5.0...'
  }
});

// Database Query
await logger.logDatabaseQuery({
  timestamp: new Date().toISOString(),
  level: 'info',
  eventType: EventType.DATABASE_QUERY,
  service: 'notes-app-backend',
  message: 'Executing SELECT query',
  metadata: {
    operation: 'SELECT',
    table: 'notes',
    duration: 45
  }
});
```

## Automatic Logging

The application automatically logs:
- **All HTTP requests** (via Fastify `onRequest` hook)
- **All HTTP responses** (via Fastify `onResponse` hook)
- **All errors** (via Fastify error handler)
- **System events** (startup, shutdown)

## Consuming Logs

### Using Kafka Console Consumer

```bash
# Connect to Kafka container
docker-compose exec kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic application-logs \
  --from-beginning
```

### Example Consumer Script

See `backend/src/consumers/log-consumer.ts` for a TypeScript consumer example.

## Event Schema

All events follow this base structure:

```typescript
{
  timestamp: string;        // ISO 8601 timestamp
  level: 'info' | 'warn' | 'error' | 'debug';
  eventType: EventType;     // Event category
  service: string;          // Service identifier
  message: string;          // Human-readable message
  metadata?: Record<string, any>;  // Event-specific data
}
```

## Error Handling

- If Kafka is unavailable, logs are still printed to console
- Application continues to function even if Kafka connection fails
- Connection retries are handled automatically
- Failed log sends don't break the application

## Performance Considerations

- Logs are sent asynchronously (non-blocking)
- Batch sending is supported for high-volume scenarios
- Producer uses idempotent mode for reliability
- Connection pooling is handled by KafkaJS

## Monitoring

Monitor Kafka topics using:
- Kafka UI tools (e.g., Kafka Manager, Kafdrop)
- Kafka CLI tools
- Custom consumers for log aggregation
- Integration with log aggregation services (ELK, Splunk, etc.)

## Disabling Kafka

Set `KAFKA_ENABLED=false` to disable Kafka logging. The application will:
- Skip Kafka connection
- Still log to console
- Continue normal operation

