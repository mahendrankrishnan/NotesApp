import { logger } from './logger.js';
import { EventType } from '../types/events.js';
import type {
  AccessVerificationResult,
  Application,
  LoginRequest,
  LoginResponse,
  LoginResult,
  UserApplicationsRoles,
} from '../types/auth.js';

const AUTH_API_URL = process.env.AUTH_API_URL || 'http://localhost:4501';
const REQUIRED_APP_NAME = process.env.REQUIRED_APP_NAME || 'MyNote';

export async function fetchUserApplicationsRoles(
  userId: number,
  authHeader?: string
): Promise<UserApplicationsRoles> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (authHeader) {
    headers.Authorization = authHeader;
  }

  const response = await fetch(
    `${AUTH_API_URL}/api/users/${userId}/applications-roles`,
    { headers }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch applications-roles: ${response.status} ${response.statusText}`
    );
  }

  return response.json() as Promise<UserApplicationsRoles>;
}

export function verifyApplicationAccessForUser(
  userId: number,
  applications: Application[]
): AccessVerificationResult {
  const application = applications.find(
    (app) => app.appName === REQUIRED_APP_NAME
  );

  if (!application) {
    return {
      authorized: false,
      reason: `Access denied: no access to ${REQUIRED_APP_NAME}`,
      userId,
    };
  }

  if (!application.roles || application.roles.length === 0) {
    return {
      authorized: false,
      reason: `Access denied: no roles assigned for ${REQUIRED_APP_NAME}`,
      userId,
      appName: application.appName,
    };
  }

  return {
    authorized: true,
    userId,
    appName: application.appName,
    roles: application.roles.map((role) => role.roleName),
  };
}

export function verifyApplicationAccess(
  data: UserApplicationsRoles
): AccessVerificationResult {
  return verifyApplicationAccessForUser(data.userId, data.applications);
}

export async function loginUser(credentials: LoginRequest): Promise<LoginResult> {
  try {
    const response = await fetch(`${AUTH_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null) as
        | { message?: string; error?: { message?: string } }
        | null;
      const message =
        errorBody?.message ||
        errorBody?.error?.message ||
        `Login failed: ${response.status} ${response.statusText}`;

      await logger.warn(EventType.AUTHORIZATION, `Login failed: ${message}`, {
        email: credentials.email,
      });

      return {
        authorized: false,
        reason: message,
      };
    }

    const loginData = (await response.json()) as LoginResponse;
    const accessResult = verifyApplicationAccessForUser(
      loginData.user.id,
      loginData.applications
    );

    const logMethod = accessResult.authorized
      ? logger.info.bind(logger)
      : logger.warn.bind(logger);
    await logMethod(
      EventType.AUTHORIZATION,
      accessResult.authorized
        ? `User ${loginData.user.id} logged in and authorized for ${REQUIRED_APP_NAME}`
        : `User ${loginData.user.id} login succeeded but access denied: ${accessResult.reason}`,
      {
        userId: loginData.user.id,
        username: loginData.user.username,
        appName: accessResult.appName,
        roles: accessResult.roles,
        authorized: accessResult.authorized,
      }
    );

    if (!accessResult.authorized) {
      return {
        authorized: false,
        reason: accessResult.reason,
      };
    }

    return {
      authorized: true,
      message: loginData.message,
      token: loginData.token,
      user: loginData.user,
      appName: accessResult.appName,
      roles: accessResult.roles,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown login error';

    await logger.error(EventType.AUTHORIZATION, `Login failed: ${message}`, {
      email: credentials.email,
      error: message,
    });

    return {
      authorized: false,
      reason: `Login failed: ${message}`,
    };
  }
}

export async function verifyUserAccess(
  userId: number,
  authHeader?: string
): Promise<AccessVerificationResult> {
  try {
    const data = await fetchUserApplicationsRoles(userId, authHeader);
    const result = verifyApplicationAccess(data);

    const logMethod = result.authorized ? logger.info.bind(logger) : logger.warn.bind(logger);
    await logMethod(
      EventType.AUTHORIZATION,
      result.authorized
        ? `User ${userId} authorized for ${REQUIRED_APP_NAME}`
        : `User ${userId} access denied: ${result.reason}`,
      {
        userId,
        appName: result.appName,
        roles: result.roles,
        authorized: result.authorized,
      }
    );

    return result;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown authorization error';

    await logger.error(
      EventType.AUTHORIZATION,
      `User ${userId} access verification failed: ${message}`,
      {
        userId,
        error: message,
      }
    );

    return {
      authorized: false,
      reason: `Access denied: unable to verify permissions (${message})`,
      userId,
    };
  }
}
