export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug',
}

export enum EventType {
  API_REQUEST = 'api.request',
  API_RESPONSE = 'api.response',
  API_ERROR = 'api.error',
  DATABASE_QUERY = 'database.query',
  DATABASE_ERROR = 'database.error',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  SYSTEM = 'system',
}

export interface LogEvent {
  timestamp: string
  level: LogLevel | string
  eventType: EventType | string
  service: string
  message: string
  metadata?: Record<string, any>
}

