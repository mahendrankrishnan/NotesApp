import { FastifyInstance } from 'fastify';
import { logConsumerService } from '../services/log-consumer.js';
import { logger } from '../services/logger.js';
import { EventType } from '../types/events.js';

export async function logsRoutes(fastify: FastifyInstance) {
  // Get logs with optional filtering
  fastify.get<{ 
    Querystring: { 
      limit?: string; 
      level?: string; 
      eventType?: string;
    } 
  }>('/api/logs', async (request, reply) => {
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
  fastify.get('/api/logs/stats', async (request, reply) => {
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
  fastify.get('/api/logs/status', async (request, reply) => {
    return reply.send({
      kafkaEnabled: logConsumerService.isKafkaEnabled(),
    });
  });
}

