import { Kafka, Producer, logLevel } from 'kafkajs';
import type { LogEvent } from '../types/events.js';

class KafkaService {
  private kafka!: Kafka;
  private producer: Producer | null = null;
  private isConnected = false;
  private readonly topic: string;
  private readonly enabled: boolean;
  private initialRetryTime=100
  constructor() {
    this.enabled = process.env.KAFKA_ENABLED === 'true';
    this.topic = process.env.KAFKA_LOG_TOPIC || 'application-logs';

    if (!this.enabled) {
      console.log('Kafka logging is disabled. Set KAFKA_ENABLED=true to enable.');
      return;
    }

    const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');

    this.kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'notes-app-backend',
      brokers,
      logLevel: logLevel.ERROR,
      retry: {
        initialRetryTime: this.initialRetryTime,
        retries: 8,
      },
    });

    this.producer = this.kafka.producer({
      maxInFlightRequests: 1,
      idempotent: true,
      transactionTimeout: 30000,
    });
  }

  async connect(): Promise<void> {
    if (!this.enabled || !this.producer || this.isConnected) {
      return;
    }

    try {
      await this.producer.connect();
      this.isConnected = true;
      console.log('✅ Connected to Kafka for logging');
    } catch (error) {
      console.error('❌ Failed to connect to Kafka:', error);
      // Don't throw - allow app to continue without Kafka
      this.isConnected = false;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.enabled || !this.producer || !this.isConnected) {
      return;
    }

    try {
      await this.producer.disconnect();
      this.isConnected = false;
      console.log('Disconnected from Kafka');
    } catch (error) {
      console.error('Error disconnecting from Kafka:', error);
    }
  }

  async sendLog(event: LogEvent): Promise<void> {
    if (!this.enabled || !this.producer || !this.isConnected) {
      // Silently fail if Kafka is not available
      return;
    }

    try {
      const message = {
        key: `${event.eventType}-${Date.now()}`,
        value: JSON.stringify({
          ...event,
          timestamp: event.timestamp || new Date().toISOString(),
        }),
        headers: {
          'event-type': event.eventType,
          'log-level': event.level,
          'service': event.service,
        },
      };

      await this.producer.send({
        topic: this.topic,
        messages: [message],
      });
    } catch (error) {
      // Log error but don't throw - don't break the application
      console.error('Failed to send log to Kafka:', error);
    }
  }

  async sendBatchLogs(events: LogEvent[]): Promise<void> {
    if (!this.enabled || !this.producer || !this.isConnected || events.length === 0) {
      return;
    }

    try {
      const messages = events.map((event) => ({
        key: `${event.eventType}-${Date.now()}-${Math.random()}`,
        value: JSON.stringify({
          ...event,
          timestamp: event.timestamp || new Date().toISOString(),
        }),
        headers: {
          'event-type': event.eventType,
          'log-level': event.level,
          'service': event.service,
        },
      }));

      await this.producer.send({
        topic: this.topic,
        messages,
      });
    } catch (error) {
      console.error('Failed to send batch logs to Kafka:', error);
    }
  }

  isKafkaEnabled(): boolean {
    return this.enabled && this.isConnected;
  }
}

// Create Singleton instance for application-wide use
export const kafkaService = new KafkaService();

