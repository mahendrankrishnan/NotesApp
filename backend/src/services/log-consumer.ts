import { Kafka, logLevel, Consumer } from 'kafkajs';
import type { LogEvent } from '../types/events.js';

class LogConsumerService {
  private kafka!: Kafka;
  private consumer: Consumer | null = null;
  private isConnected = false;
  private readonly topic: string;
  private readonly enabled: boolean;
  private logBuffer: LogEvent[] = [];
  private readonly maxBufferSize = 1000; // Keep last 1000 logs in memory

  constructor() {
    this.enabled = process.env.KAFKA_ENABLED === 'true';
    this.topic = process.env.KAFKA_LOG_TOPIC || 'application-logs';

    if (!this.enabled) {
      console.log('Kafka logging is disabled. Log consumer will not start.');
      return;
    }

    const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');

    this.kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'notes-app-backend',
      brokers,
      logLevel: logLevel.ERROR,
    });

    this.consumer = this.kafka.consumer({
      groupId: 'log-api-consumer-group',
      allowAutoTopicCreation: true,
    });
  }

  async connect(): Promise<void> {
    if (!this.enabled || !this.consumer || this.isConnected) {
      return;
    }

    try {
      await this.consumer.connect();
      await this.consumer.subscribe({ topic: this.topic, fromBeginning: false });
      this.isConnected = true;
      console.log('✅ Log consumer connected to Kafka');

      // Start consuming messages
      await this.consumer.run({
        eachMessage: async ({ message }) => {
          try {
            const logEvent: LogEvent = JSON.parse(message.value?.toString() || '{}');
            this.addToBuffer(logEvent);
          } catch (error) {
            console.error('Error parsing log message:', error);
          }
        },
      });
    } catch (error) {
      console.error('❌ Failed to connect log consumer to Kafka:', error);
      this.isConnected = false;
    }
  }

  private addToBuffer(event: LogEvent): void {
    this.logBuffer.push(event);
    // Keep only the last maxBufferSize logs
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }
  }

  async disconnect(): Promise<void> {
    if (!this.enabled || !this.consumer || !this.isConnected) {
      return;
    }

    try {
      await this.consumer.disconnect();
      this.isConnected = false;
      console.log('Log consumer disconnected from Kafka');
    } catch (error) {
      console.error('Error disconnecting log consumer:', error);
    }
  }

  getLogs(limit: number = 100, level?: string, eventType?: string): LogEvent[] {
    let filteredLogs = [...this.logBuffer];

    // Filter by level if provided
    if (level) {
      filteredLogs = filteredLogs.filter((log) => log.level === level);
    }

    // Filter by event type if provided
    if (eventType) {
      filteredLogs = filteredLogs.filter((log) => log.eventType === eventType);
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Return limited results
    return filteredLogs.slice(0, limit);
  }

  getLogStats(): {
    total: number;
    byLevel: Record<string, number>;
    byEventType: Record<string, number>;
  } {
    const stats = {
      total: this.logBuffer.length,
      byLevel: {} as Record<string, number>,
      byEventType: {} as Record<string, number>,
    };

    this.logBuffer.forEach((log) => {
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
      stats.byEventType[log.eventType] = (stats.byEventType[log.eventType] || 0) + 1;
    });

    return stats;
  }

  isKafkaEnabled(): boolean {
    return this.enabled && this.isConnected;
  }
}

// Singleton instance
export const logConsumerService = new LogConsumerService();

