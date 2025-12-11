import { kafkaService } from './kafka.js';
import {
  LogLevel,
  EventType,
  type LogEvent,
  type BaseLogEvent,
  type ApiRequestEvent,
  type ApiResponseEvent,
  type ApiErrorEvent,
  type DatabaseQueryEvent,
  type DatabaseErrorEvent,
  type SystemEvent,
} from '../types/events.js';

const SERVICE_NAME = process.env.SERVICE_NAME || 'notes-app-backend';

class Logger {
  private async sendToKafka(event: LogEvent): Promise<void> {
    await kafkaService.sendLog(event);
  }

  private createBaseEvent(
    level: LogLevel,
    eventType: EventType,
    message: string,
    metadata?: Record<string, any>
  ): BaseLogEvent {
    return {
      timestamp: new Date().toISOString(),
      level,
      eventType,
      service: SERVICE_NAME,
      message,
      metadata: metadata || {},
    };
  }

  async info(eventType: EventType, message: string, metadata?: Record<string, any>): Promise<void> {
    const event = this.createBaseEvent(LogLevel.INFO, eventType, message, metadata);
    await this.sendToKafka(event);
    console.log(`[INFO] ${message}`, metadata || '');
  }

  async warn(eventType: EventType, message: string, metadata?: Record<string, any>): Promise<void> {
    const event = this.createBaseEvent(LogLevel.WARN, eventType, message, metadata);
    await this.sendToKafka(event);
    console.warn(`[WARN] ${message}`, metadata || '');
  }

  async error(eventType: EventType, message: string, metadata?: Record<string, any>): Promise<void> {
    const event = this.createBaseEvent(LogLevel.ERROR, eventType, message, metadata);
    await this.sendToKafka(event);
    console.error(`[ERROR] ${message}`, metadata || '');
  }

  async debug(eventType: EventType, message: string, metadata?: Record<string, any>): Promise<void> {
    const event = this.createBaseEvent(LogLevel.DEBUG, eventType, message, metadata);
    await this.sendToKafka(event);
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, metadata || '');
    }
  }

  // Specialized logging methods
  async logApiRequest(event: ApiRequestEvent): Promise<void> {
    await this.sendToKafka(event);
    console.log(`[API] ${event.metadata.method} ${event.metadata.path}`);
  }

  async logApiResponse(event: ApiResponseEvent): Promise<void> {
    await this.sendToKafka(event);
    const level = event.metadata.statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;
    console[level === LogLevel.WARN ? 'warn' : 'log'](
      `[API] ${event.metadata.method} ${event.metadata.path} ${event.metadata.statusCode} (${event.metadata.responseTime}ms)`
    );
  }

  async logApiError(event: ApiErrorEvent): Promise<void> {
    await this.sendToKafka(event);
    console.error(
      `[API ERROR] ${event.metadata.method} ${event.metadata.path} ${event.metadata.statusCode}`,
      event.metadata.error
    );
  }

  async logDatabaseQuery(event: DatabaseQueryEvent): Promise<void> {
    await this.sendToKafka(event);
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DB] ${event.metadata.operation} (${event.metadata.duration}ms)`);
    }
  }

  async logDatabaseError(event: DatabaseErrorEvent): Promise<void> {
    await this.sendToKafka(event);
    console.error(`[DB ERROR] ${event.metadata.operation}`, event.metadata.error);
  }

  async logSystemEvent(event: SystemEvent): Promise<void> {
    await this.sendToKafka(event);
    console.log(`[SYSTEM] ${event.metadata.component}: ${event.metadata.action}`);
  }
}

// Export singleton instance
export const logger = new Logger();

// Re-export types for convenience
export type { LogEvent, LogLevel, EventType } from '../types/events.js';

