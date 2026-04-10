export interface User {
  id?: string;
  email: string;
  fullName: string;
  fileCount: number;
  totalSize: number;
  pendingSessions: number;
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
