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

export interface BaseLogEvent {
  timestamp: string;
  level: LogLevel;
  eventType: EventType;
  service: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface ApiRequestEvent extends BaseLogEvent {
  eventType: EventType.API_REQUEST;
  metadata: {
    method: string;
    path: string;
    query?: Record<string, any>;
    params?: Record<string, any>;
    headers?: Record<string, string>;
    ip?: string;
    userAgent?: string;
  };
}

export interface ApiResponseEvent extends BaseLogEvent {
  eventType: EventType.API_RESPONSE;
  metadata: {
    method: string;
    path: string;
    statusCode: number;
    responseTime: number;
    contentLength?: number;
  };
}

export interface ApiErrorEvent extends BaseLogEvent {
  eventType: EventType.API_ERROR;
  level: LogLevel.ERROR;
  metadata: {
    method: string;
    path: string;
    statusCode: number;
    error: {
      name: string;
      message: string;
      stack?: string;
    };
  };
}

export interface DatabaseQueryEvent extends BaseLogEvent {
  eventType: EventType.DATABASE_QUERY;
  metadata: {
    operation: string;
    table?: string;
    query?: string;
    duration: number;
  };
}

export interface DatabaseErrorEvent extends BaseLogEvent {
  eventType: EventType.DATABASE_ERROR;
  level: LogLevel.ERROR;
  metadata: {
    operation: string;
    table?: string;
    error: {
      name: string;
      message: string;
      code?: string;
    };
  };
}

export interface SystemEvent extends BaseLogEvent {
  eventType: EventType.SYSTEM;
  metadata: {
    component: string;
    action: string;
    [key: string]: any;
  };
}

export type LogEvent =
  | ApiRequestEvent
  | ApiResponseEvent
  | ApiErrorEvent
  | DatabaseQueryEvent
  | DatabaseErrorEvent
  | SystemEvent
  | BaseLogEvent;

