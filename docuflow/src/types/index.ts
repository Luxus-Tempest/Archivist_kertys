export type FileStatus = 'pending' | 'processing' | 'classified' | 'uploaded' | 'error';

export interface TrackedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: FileStatus;
  progress: number;
  errorMessage?: string;
}

export interface Session {
  id: string;
  createdAt: string; // ISO string
  files: SessionFile[];
}

export interface SessionFile {
  name: string;
  size: number;
  type: string;
  status: FileStatus;
}
