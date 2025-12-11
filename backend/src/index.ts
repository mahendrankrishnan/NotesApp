import Fastify from 'fastify';
import cors from '@fastify/cors';
import { notesRoutes } from './routes/notes.js';
import { logsRoutes } from './routes/logs.js';
import { kafkaService } from './services/kafka.js';
import { logConsumerService } from './services/log-consumer.js';
import { logger } from './services/logger.js';
import { LogLevel, EventType } from './types/events.js';

const fastify = Fastify({
  logger: true,
});

// Register CORS
fastify.register(cors, {
  origin: true, // Allow all origins in development
  credentials: true,
});

// Register routes
fastify.register(notesRoutes);
fastify.register(logsRoutes);

// Health check
fastify.get('/health', async (request, reply) => {
  return { status: 'ok' };
});

// Request logging hook
fastify.addHook('onRequest', async (request, reply) => {
  await logger.logApiRequest({
    timestamp: new Date().toISOString(),
    level: LogLevel.INFO,
    eventType: EventType.API_REQUEST,
    service: process.env.SERVICE_NAME || 'notes-app-backend',
    message: `Incoming ${request.method} request to ${request.url}`,
    metadata: {
      method: request.method,
      path: request.url,
      query: request.query as Record<string, any>,
      params: request.params as Record<string, any>,
      headers: request.headers as Record<string, string>,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    },
  });
});

// Response logging hook
fastify.addHook('onResponse', async (request, reply) => {
  const responseTime = reply.getResponseTime();
  await logger.logApiResponse({
    timestamp: new Date().toISOString(),
    level: reply.statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO,
    eventType: EventType.API_RESPONSE,
    service: process.env.SERVICE_NAME || 'notes-app-backend',
    message: `${request.method} ${request.url} responded with ${reply.statusCode}`,
    metadata: {
      method: request.method,
      path: request.url,
      statusCode: reply.statusCode,
      responseTime,
      contentLength: reply.getHeader('content-length')
        ? parseInt(reply.getHeader('content-length') as string)
        : undefined,
    },
  });
});

// Error logging hook
fastify.setErrorHandler(async (error, request, reply) => {
  await logger.logApiError({
    timestamp: new Date().toISOString(),
    level: LogLevel.ERROR,
    eventType: EventType.API_ERROR,
    service: process.env.SERVICE_NAME || 'notes-app-backend',
    message: `Error handling ${request.method} ${request.url}`,
    metadata: {
      method: request.method,
      path: request.url,
      statusCode: reply.statusCode || 500,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    },
  });

  reply.status(error.statusCode || 500).send({
    error: {
      message: error.message,
    },
  });
});

const start = async () => {
  try {
    // Connect to Kafka
    await kafkaService.connect();
    await logConsumerService.connect();
    await logger.logSystemEvent({
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      eventType: EventType.SYSTEM,
      service: process.env.SERVICE_NAME || 'notes-app-backend',
      message: 'Server starting',
      metadata: {
        component: 'server',
        action: 'start',
      },
    });

    const port = parseInt(process.env.PORT || '4202');
    await fastify.listen({ port, host: '0.0.0.0' });
    
    await logger.logSystemEvent({
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      eventType: EventType.SYSTEM,
      service: process.env.SERVICE_NAME || 'notes-app-backend',
      message: `Server listening on port ${port}`,
      metadata: {
        component: 'server',
        action: 'listening',
        port,
      },
    });
    
    console.log(`🚀 Server listening on http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    await logger.error(EventType.SYSTEM, 'Failed to start server', {
      error: err instanceof Error ? {
        name: err.name,
        message: err.message,
        stack: err.stack,
      } : err,
    });
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  await logger.logSystemEvent({
    timestamp: new Date().toISOString(),
    level: LogLevel.INFO,
    eventType: EventType.SYSTEM,
    service: process.env.SERVICE_NAME || 'notes-app-backend',
    message: 'Server shutting down',
    metadata: {
      component: 'server',
      action: 'shutdown',
    },
  });
  await kafkaService.disconnect();
  await logConsumerService.disconnect();
  await fastify.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await logger.logSystemEvent({
    timestamp: new Date().toISOString(),
    level: LogLevel.INFO,
    eventType: EventType.SYSTEM,
    service: process.env.SERVICE_NAME || 'notes-app-backend',
    message: 'Server shutting down',
    metadata: {
      component: 'server',
      action: 'shutdown',
    },
  });
  await kafkaService.disconnect();
  await logConsumerService.disconnect();
  await fastify.close();
  process.exit(0);
});

start();

