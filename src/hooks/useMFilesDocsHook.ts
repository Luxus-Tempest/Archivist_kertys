import { useState, useCallback } from 'react';
import { fetchAuth, fetchAuthBlob } from '../utils/api';

export interface MFilesObjVerDto {
  Version: number;
  VersionType: number;
  ID: number;
  Type: number;
}

export interface MFilesFileDto {
  Name: string;
  Extension: string;
  Size: number;
  LastModified: string;
  CreatedUtc: string;
  FileGUID: string;
  ID: number;
  Version: number;
  FileVersionType: number;
}

export interface MFilesDocumentDto {
  Title: string;
  DisplayID: string;
  ObjVer: MFilesObjVerDto;
  Class: number;
  SingleFile: boolean;
  Deleted: boolean;
  Files: MFilesFileDto[];
  ObjectGUID: string;
  propertyID: number;
  BaseProperties: any[]; // Maps to JsonElement array
}

export interface MFilesItemsResponseDto {
  Items: MFilesDocumentDto[];
  MoreResults: boolean;
}

export function useMFilesDocsHook() {
  const [documents, setDocuments] = useState<MFilesDocumentDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);

  const fetchDocuments = useCallback(async (classId?: number): Promise<MFilesItemsResponseDto | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const url = classId !== undefined
        ? `/MFilesDocs/getDocuments?class=${classId}`
        : '/MFilesDocs/getDocuments';
      const data: any = await fetchAuth(url, {
        method: 'GET'
      });
      
      console.log("MFiles API response:", data);
      
      const docs = data.Items || data.items || [];
      const hasMoreResults = data.MoreResults || data.moreResults || false;
      
      setDocuments(docs);
      setHasMore(hasMoreResults);
      return data;
    } catch (err: any) {
      const errorMessage = err.message || "Erreur lors de la récupération des documents MFiles.";
      setError(errorMessage);
      console.error("useMFilesDocsHook error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getFileContent = useCallback(async (objectId: number, fileId: number): Promise<string | null> => {
    try {
      const blob = await fetchAuthBlob(`/MFilesDocs/${objectId}/files/${fileId}/content`);
      return URL.createObjectURL(blob);
    } catch (err) {
      console.error("useMFilesDocsHook getFileContent error:", err);
      return null;
    }
  }, []);

  const getFileProperties = useCallback(async (objectId: number): Promise<any | null> => {
    try {
      const data = await fetchAuth(`/MFilesDocs/get-file-properties/${objectId}`);
      return data;
    } catch (err) {
      console.error("useMFilesDocsHook getFileProperties error:", err);
      return null;
    }
  }, []);

  const fetchVaultClasses = useCallback(async (): Promise<{id: number, name: string}[] | null> => {
    try {
      const data = await fetchAuth('/MFilesDocs/get-vault-classes', {
        method: 'GET'
      });
      return data;
    } catch (err) {
      console.error("useMFilesDocsHook fetchVaultClasses error:", err);
      return null;
    }
  }, []);

  return {
    documents,
    isLoading,
    error,
    hasMore,
    fetchDocuments,
    getFileContent,
    getFileProperties,
    fetchVaultClasses
  };
}
