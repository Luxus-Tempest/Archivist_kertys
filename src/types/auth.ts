export type UserRole = 'USER' | 'ADMIN';

export type UserStatus = 'PENDING' | 'ACTIVE' | 'BLOCKED';

export const UserStatusEnum = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  BLOCKED: 'BLOCKED',
} as const;

export const UserRoleEnum = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  OWNER: 'OWNER',
} as const;

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  organizationId: string;
  fileCount?: number;
  totalSize?: number;
  pendingSessions?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ErrorResponse {
  message?: string;
  [key: string]: any;
}

export interface CreateOrganizationPayload {
  orgName: string;
  orgDomain: string;
  orgEmail: string;
  adminEmail: string;
  adminFullName: string;
  adminPassword: string;
}

export interface RegisterInvitedUserPayload {
  // token: string;
  FullName?: string;
  Password: string;
}
