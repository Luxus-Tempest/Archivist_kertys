import { useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchAuth } from '../utils/api';
import type { UploadResponse, HistoryResponse } from '../types/documents';
import { setHistoryLoading, setHistoryData, setHistoryError } from '../store/docs/docsSlice';

export function useDocument() {
  const dispatch = useAppDispatch();
  const [isUploading, setIsUploading] = useState(false);
  const [localError, setError] = useState<string | null>(null);
  
  const { history } = useAppSelector((state) => state.docs);

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
      setError(err.message || "An error occurred during file upload.");
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

  const getHistory = useCallback(async (params?: { offset?: number, limit?: number }) => {
    const offset = params?.offset ?? 0;
    const limit = params?.limit ?? 10;

    dispatch(setHistoryLoading());
    try {
      const data = await fetchAuth(`/docs/user/sessions-infos?offset=${offset}&limit=${limit}`);
      dispatch(setHistoryData(data as HistoryResponse));
    } catch (err: any) {
      dispatch(setHistoryError(err.message || "Failed to fetch history"));
    }
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
