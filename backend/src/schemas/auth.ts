export const userIdParamSchema = {
  type: 'object',
  required: ['userId'],
  properties: {
    userId: {
      type: 'string',
      pattern: '^[0-9]+$',
      description: 'Numeric user ID',
    },
  },
} as const;

export const accessVerificationSchema = {
  type: 'object',
  properties: {
    authorized: { type: 'boolean' },
    reason: { type: 'string' },
    userId: { type: 'number' },
    appName: { type: 'string' },
    roles: {
      type: 'array',
      items: { type: 'string' },
    },
  },
} as const;

export const loginRequestSchema = {
  type: 'object',
  required: ['email', 'phone', 'password'],
  properties: {
    email: { type: 'string', format: 'email' },
    phone: { type: 'string', minLength: 1 },
    password: { type: 'string', minLength: 1 },
  },
} as const;

export const loginResultSchema = {
  type: 'object',
  properties: {
    authorized: { type: 'boolean' },
    reason: { type: 'string' },
    message: { type: 'string' },
    token: { type: 'string' },
    user: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        username: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
      },
    },
    appName: { type: 'string' },
    roles: {
      type: 'array',
      items: { type: 'string' },
    },
  },
} as const;

export const errorSchema = {
  type: 'object',
  properties: {
    error: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  },
} as const;
