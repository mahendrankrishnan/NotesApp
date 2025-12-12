import { FastifyInstance } from 'fastify';
import { logConsumerService } from '../services/log-consumer.js';
import { logger } from '../services/logger.js';
import { EventType } from '../types/events.js';
import {
  logsResponseSchema,
  logStatsSchema,
  logStatusSchema,
  logsQuerySchema,
  errorSchema,
} from '../schemas/logs.js';

export async function logsRoutes(fastify: FastifyInstance) {
  // Get logs with optional filtering
  fastify.get<{ 
    Querystring: { 
      limit?: string; 
      level?: string; 
      eventType?: string;
    } 
  }>('/api/logs', {
    schema: {
      description: 'Get application logs with optional filtering',
      tags: ['logs'],
      querystring: logsQuerySchema,
      response: {
        200: logsResponseSchema,
        503: errorSchema,
        500: errorSchema,
      },
    },
  }, async (request, reply) => {
    try {
      if (!logConsumerService.isKafkaEnabled()) {
        return reply.status(503).send({ 
          error: 'Kafka logging is not enabled or not connected',
          enabled: false,
        });
      }

      const limit = parseInt(request.query.limit || '100');
      const level = request.query.level;
      const eventType = request.query.eventType;

      const logs = logConsumerService.getLogs(limit, level, eventType);

      return reply.send({
        logs,
        count: logs.length,
        kafkaEnabled: true,
      });
    } catch (error) {
      await logger.error(EventType.API_ERROR, 'Failed to fetch logs', {
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
        } : error,
      });
      return reply.status(500).send({ error: 'Failed to fetch logs' });
    }
  });

  // Get log statistics
  fastify.get('/api/logs/stats', {
    schema: {
      description: 'Get log statistics',
      tags: ['logs'],
      response: {
        200: logStatsSchema,
        503: errorSchema,
        500: errorSchema,
      },
    },
  }, async (request, reply) => {
    try {
      if (!logConsumerService.isKafkaEnabled()) {
        return reply.status(503).send({ 
          error: 'Kafka logging is not enabled or not connected',
          enabled: false,
        });
      }

      const stats = logConsumerService.getLogStats();

      return reply.send({
        ...stats,
        kafkaEnabled: true,
      });
    } catch (error) {
      await logger.error(EventType.API_ERROR, 'Failed to fetch log stats', {
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
        } : error,
      });
      return reply.status(500).send({ error: 'Failed to fetch log stats' });
    }
  });

  // Get Kafka connection status
  fastify.get('/api/logs/status', {
    schema: {
      description: 'Get Kafka connection status',
      tags: ['logs'],
      response: {
        200: logStatusSchema,
      },
    },
  }, async (request, reply) => {
    return reply.send({
      kafkaEnabled: logConsumerService.isKafkaEnabled(),
    });
  });
}

