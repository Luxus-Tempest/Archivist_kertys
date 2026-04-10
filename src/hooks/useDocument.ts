import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAuth } from '../utils/api';
import type { UploadResponse } from '../types/documents';
import { fetchHistory } from '../store/docs/docsSlice';
import type { RootState, AppDispatch } from '../store';

export function useDocument() {
  const dispatch = useDispatch<AppDispatch>();
  const [isUploading, setIsUploading] = useState(false);
  const [localError, setError] = useState<string | null>(null);
  
  const { history } = useSelector((state: RootState) => state.docs);

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

  const getHistory = useCallback((params?: { offset?: number, limit?: number }) => {
    return dispatch(fetchHistory(params));
  }, [dispatch]);

  return {
    uploadFiles,
    fetchPendingSessions,
    getHistory,
    history,
    isUploading,
    error: localError
  };
}
