import { FastifyInstance } from 'fastify';
import { loginUser, verifyUserAccess } from '../services/auth-access.js';
import {
  userIdParamSchema,
  accessVerificationSchema,
  loginRequestSchema,
  loginResultSchema,
  errorSchema,
} from '../schemas/auth.js';
import type { LoginRequest } from '../types/auth.js';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/api/auth/login', {
    schema: {
      description: 'Authenticate user and verify application access',
      tags: ['auth'],
      body: loginRequestSchema,
      response: {
        200: loginResultSchema,
        400: errorSchema,
        401: loginResultSchema,
        500: errorSchema,
      },
    },
  }, async (request, reply) => {
    const credentials = request.body as LoginRequest;
    const result = await loginUser(credentials);

    if (!result.authorized) {
      const statusCode = result.reason?.startsWith('Login failed') ? 500 : 401;
      return reply.status(statusCode).send(result);
    }

    return result;
  });

  fastify.get('/api/auth/verify-access/:userId', {
    schema: {
      description:
        'Verify user has access to the required application with at least one role',
      tags: ['auth'],
      params: userIdParamSchema,
      response: {
        200: accessVerificationSchema,
        400: errorSchema,
        500: errorSchema,
      },
    },
  }, async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const parsedUserId = parseInt(userId, 10);

    if (Number.isNaN(parsedUserId)) {
      return reply.status(400).send({
        error: { message: 'Invalid user ID' },
      });
    }

    const authHeader = request.headers.authorization;
    const result = await verifyUserAccess(parsedUserId, authHeader);

    return result;
  });
}
