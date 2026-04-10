import { useState } from 'react';
import { fetchAuth } from '../utils/api';
import type { UploadResponse } from '../types/documents';


export function useDocument() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const uploadFiles = async (files: File[]): Promise<UploadResponse | null> => {
    setIsUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file); 
      });
      
      const response = await fetchAuth('/docs/upload', {
        method: 'POST',
        body: formData
      });
      
      return response as UploadResponse;
    } catch (err: any) {
      setError(err.message || "Une erreur s'est produite lors de l'upload des fichiers.");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const fetchPendingSessions = async (): Promise<string[]> => {
    try {
      const data = await fetchAuth('/docs/pendingSessions');
      return data.pendingSessions || [];
    } catch (err) {
      console.error("Failed to fetch pending sessions:", err);
      return [];
    }
  };

  return {
    uploadFiles,
    fetchPendingSessions,
    isUploading,
    error
  };
}
