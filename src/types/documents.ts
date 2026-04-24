export const ProcessingStatus = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  CLASSIFIED: 'Classified',
  COMPLETED: 'Completed',
  UPLOADED: 'Uploaded',
  FAILED: 'Failed',
} as const;

export type ProcessingStatus = typeof ProcessingStatus[keyof typeof ProcessingStatus] | string;

export const MFDataType = {
  Uninitialized: 0,
  Text: 1,
  Integer: 2,
  Floating: 3,
  Date: 5,
  Time: 6,
  Timestamp: 7,
  Boolean: 8,
  Lookup: 9,
  MultiSelectLookup: 10,
  Integer64: 11,
  FILETIME: 12,
  MultiLineText: 13,
} as const;

export type MFDataType = typeof MFDataType[keyof typeof MFDataType];

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
