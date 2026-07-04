import type {
  Application,
  AuthSession,
  LoginCredentials,
  LoginResponse,
  LoginResult,
} from '@/types/auth'

const AUTH_API_URL =
  process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:4501'
const REQUIRED_APP_NAME =
  process.env.NEXT_PUBLIC_REQUIRED_APP_NAME || 'MyNote'

export const AUTH_SESSION_KEY = 'notes_auth_session'

export function getStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = sessionStorage.getItem(AUTH_SESSION_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as AuthSession
  } catch {
    sessionStorage.removeItem(AUTH_SESSION_KEY)
    return null
  }
}

export function storeSession(session: AuthSession): void {
  sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  sessionStorage.removeItem(AUTH_SESSION_KEY)
}

function verifyApplicationAccess(
  userId: number,
  applications: Application[]
): Pick<LoginResult, 'authorized' | 'reason' | 'appName' | 'roles'> {
  const application = applications.find(
    (app) => app.appName === REQUIRED_APP_NAME
  )

  if (!application) {
    return {
      authorized: false,
      reason: `Access denied: no access to ${REQUIRED_APP_NAME}`,
    }
  }

  if (!application.roles || application.roles.length === 0) {
    return {
      authorized: false,
      reason: `Access denied: no roles assigned for ${REQUIRED_APP_NAME}`,
      appName: application.appName,
    }
  }

  return {
    authorized: true,
    appName: application.appName,
    roles: application.roles.map((role) => role.roleName),
  }
}

export async function login(credentials: LoginCredentials): Promise<LoginResult> {
  const response = await fetch(`${AUTH_API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as
      | { message?: string; error?: string | { message?: string } }
      | null

    const message =
      errorBody?.message ||
      (typeof errorBody?.error === 'string'
        ? errorBody.error
        : errorBody?.error?.message) ||
      'Login failed. Please check your credentials.'

    return {
      authorized: false,
      reason: message,
    }
  }

  const loginData = (await response.json()) as LoginResponse
  const accessResult = verifyApplicationAccess(
    loginData.user.id,
    loginData.applications
  )

  if (!accessResult.authorized) {
    return {
      authorized: false,
      reason: accessResult.reason,
      appName: accessResult.appName,
    }
  }

  return {
    authorized: true,
    message: loginData.message,
    token: loginData.token,
    user: loginData.user,
    appName: accessResult.appName,
    roles: accessResult.roles,
  }
}
