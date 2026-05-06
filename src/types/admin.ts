export type UserStatus = 'ACTIVE' | 'PENDING' | 'BLOCKED';
export type UserRole = 'ADMIN' | 'USER';

export interface AdminUser {
  id: string;
  status: UserStatus;
  role: UserRole;
  fullname: string;
  email: string;
  avatar?: string; // Optinal as it might be added later
}

export interface AdminUsersResponse {
  offset: number;
  limit: number;
  totalCount: number;
  users: AdminUser[];
}

export interface AdminState {
  users: AdminUser[];
  totalCount: number;
  offset: number;
  limit: number;
  isLoading: boolean;
  isActionLoading: boolean;
  error: string | null;
  classStructure: ClassStructureResponse | null;
}

export interface ClassStructureProperty {
  type: string;
  minLength?: number;
  [key: string]: any;
}

export interface ClassStructureResponse {
  properties: Record<string, ClassStructureProperty>;
  required?: string[];
  Message?: string;
}

export interface CreateUserByAdminData {
  fullname: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
}
