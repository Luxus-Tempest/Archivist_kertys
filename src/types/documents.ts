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
