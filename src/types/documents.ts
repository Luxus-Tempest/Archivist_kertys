export const ProcessingStatus = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  CLASSIFIED: 'Classified',
  COMPLETED: 'Completed',
  UPLOADED: 'Uploaded',
  FAILED: 'Failed',
} as const;

export type ProcessingStatus = typeof ProcessingStatus[keyof typeof ProcessingStatus] | string;

export interface UploadResponse {
  message: string;
  session: {
    id: string;
    status: ProcessingStatus;
  };
  files: {
    id: string;
    status: ProcessingStatus;
    category?: string;
    fileName: string;
  }[];
}

export interface FileSessionInfo {
  fileId: string;
  fileName: string;
  fileMFId: string | null;
  fileMFClass: string | null;
  status: ProcessingStatus;
  category: string | null;
  size: number;
  createdAt: string;
  updatedAt: string;
}

export interface SessionInfo {
  sessionId: string;
  sessionStatus: string;
  date: string;
  files: FileSessionInfo[];
}

export interface HistoryResponse {
  totalCount: number;
  offset: number;
  limit: number;
  row: SessionInfo[];
}
