/**
 * Kafka Consumer for Application Logs
 * 
 * This is consumer that reads logs from Kafka.
 * You can use this as a starting point for building log aggregation,
 * monitoring, or alerting systems.
 * 
 * To use this consumer:
 * 1. Install dependencies: pnpm install
 * 2. Run: tsx src/consumers/log-consumer.ts
 */

import { Kafka, logLevel } from 'kafkajs';
import type { LogEvent } from '../types/events.js';

const kafka = new Kafka({
  clientId: 'log-consumer',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  logLevel: logLevel.ERROR,
});

const consumer = kafka.consumer({ 
  groupId: 'log-consumer-group',
  allowAutoTopicCreation: true,
});

const topic = process.env.KAFKA_LOG_TOPIC || 'application-logs';

async function startConsumer() {
  try {
    await consumer.connect();
    console.log('✅ Connected to Kafka broker(s)');

    await consumer.subscribe({ topic, fromBeginning: false });
    console.log(`📡 Subscribed to topic: ${topic}`);

    await consumer.run({
      eachMessage: async ({ topic: _topic, partition: _partition, message }) => {
        try {
          const logEvent: LogEvent = JSON.parse(message.value?.toString() || '{}');
          
          // Process the log event
          console.log(`[${logEvent.level.toUpperCase()}] ${logEvent.eventType}:`, {
            timestamp: logEvent.timestamp,
            service: logEvent.service,
            message: logEvent.message,
            metadata: logEvent.metadata,
          });

          // Example: Filter and alert on errors
          if (logEvent.level === 'error') {
            console.error('🚨 ERROR DETECTED:', logEvent);
            // Planning to add my alerting logic here in the future(email, Slack, PagerDuty, etc.)
          }

          // Example: Track API response times
          if (logEvent.eventType === 'api.response' && logEvent.metadata) {
            const responseTime = logEvent.metadata.responseTime;
            if (responseTime > 1000) {
              console.warn(`⚠️ Slow API response: ${responseTime}ms for ${logEvent.metadata.path}`);
            }
          }

        } catch (error) {
          console.error('Error processing message:', error);
        }
      },
    });
  } catch (error) {
    console.error('Consumer error:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down consumer...');
  await consumer.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Shutting down consumer...');
  await consumer.disconnect();
  process.exit(0);
});

startConsumer();

