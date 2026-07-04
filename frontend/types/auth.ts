export interface ApplicationRole {
  id: number
  roleName: string
  createdAt: string
  updatedAt: string
}

export interface Application {
  id: number
  appName: string
  createdAt: string
  updatedAt: string
  roles: ApplicationRole[]
}

export interface UserApplicationsRoles {
  userId: number
  applications: Application[]
}

export interface AccessVerificationResult {
  authorized: boolean
  reason?: string
  userId: number
  appName?: string
  roles?: string[]
}

export interface AuthUser {
  id: number
  username: string
  email: string
  phone: string
}

export interface LoginCredentials {
  email: string
  phone: string
  password: string
}

export interface LoginResponse {
  message: string
  token: string
  user: AuthUser
  applications: Application[]
}

export interface LoginResult {
  authorized: boolean
  reason?: string
  message?: string
  token?: string
  user?: AuthUser
  appName?: string
  roles?: string[]
}

export interface AuthSession {
  userId: number
  username: string
  email: string
  phone: string
  token: string
  appName?: string
  roles?: string[]
}
