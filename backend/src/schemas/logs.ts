export const logEventSchema = {
  type: 'object',
  properties: {
    timestamp: { type: 'string', format: 'date-time', description: 'Log timestamp' },
    level: { 
      type: 'string', 
      enum: ['error', 'warn', 'info', 'debug'],
      description: 'Log level' 
    },
    eventType: { 
      type: 'string', 
      enum: ['api.request', 'api.response', 'api.error', 'database.query', 'database.error', 'system'],
      description: 'Event type' 
    },
    service: { type: 'string', description: 'Service name' },
    message: { type: 'string', description: 'Log message' },
    metadata: { 
      type: 'object',
      description: 'Additional metadata',
      additionalProperties: true,
    },
  },
  required: ['timestamp', 'level', 'eventType', 'service', 'message'],
} as const;

export const logsResponseSchema = {
  type: 'object',
  properties: {
    logs: {
      type: 'array',
      items: logEventSchema,
      description: 'Array of log events',
    },
    count: { type: 'integer', description: 'Number of logs returned' },
    kafkaEnabled: { type: 'boolean', description: 'Whether Kafka is enabled' },
  },
  required: ['logs', 'count', 'kafkaEnabled'],
} as const;

export const logStatsSchema = {
  type: 'object',
  properties: {
    total: { type: 'integer', description: 'Total number of logs' },
    byLevel: {
      type: 'object',
      additionalProperties: { type: 'integer' },
      description: 'Log count by level',
    },
    byEventType: {
      type: 'object',
      additionalProperties: { type: 'integer' },
      description: 'Log count by event type',
    },
    kafkaEnabled: { type: 'boolean', description: 'Whether Kafka is enabled' },
  },
  required: ['total', 'byLevel', 'byEventType', 'kafkaEnabled'],
} as const;

export const logStatusSchema = {
  type: 'object',
  properties: {
    kafkaEnabled: { type: 'boolean', description: 'Whether Kafka is enabled' },
  },
  required: ['kafkaEnabled'],
} as const;

export const logsQuerySchema = {
  type: 'object',
  properties: {
    limit: { 
      type: 'string', 
      pattern: '^[0-9]+$',
      description: 'Maximum number of logs to return (default: 100)' 
    },
    level: { 
      type: 'string', 
      enum: ['error', 'warn', 'info', 'debug'],
      description: 'Filter by log level' 
    },
    eventType: { 
      type: 'string', 
      enum: ['api.request', 'api.response', 'api.error', 'database.query', 'database.error', 'system'],
      description: 'Filter by event type' 
    },
  },
} as const;

export const errorSchema = {
  type: 'object',
  properties: {
    error: { 
      type: 'string',
      description: 'Error message' 
    },
    enabled: { 
      type: 'boolean',
      description: 'Whether Kafka is enabled (for 503 errors)',
    },
  },
  required: ['error'],
} as const;

