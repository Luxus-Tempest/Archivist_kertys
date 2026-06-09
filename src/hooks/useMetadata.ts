import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchAuth } from '../utils/api';
import {
  setClassesLoading,
  setClassesData,
  setClassesError,
  setRowsLoading,
  setRowsData,
  setRowsError,
  clearRows,
  setDocumentsLoading,
  setDocumentsData,
  setDocumentsError,
  clearDocuments,
  setActiveRowLoading,
  setActiveRowData,
  setActiveRowError,
  clearActiveRow,
  setUpdateLoading,
  setUpdateSuccess,
  setUpdateError,
} from '../store/docs/metadataSlice';
import type {
  MetadataGlobalResponse,
  MetadataPaginatedResponse,
  MetadataRow,
  MetadataDocument,
  MetadataByDocumentIdResponse,
  MetadataUpdateResponse,
} from '../store/docs/metadataSlice';

/**
 * Hook pour interagir avec les endpoints metadata.
 *
 * 1) fetchClasses           — GET  /api/docs/metadata/global
 * 2) fetchMetadataRows      — GET  /api/docs/metadata?class=…&offset=…&limit=…
 * 3) updateMetadataRow      — PUT  /api/docs/metadata?class=…&metadataId=…
 * 4) fetchClassDocuments    — GET  /api/docs/documents?class=…&offset=…&limit=…
 * 5) fetchMetadataByDocId   — GET  /api/docs/metadata/by-class-documentid?class=…&documentId=…
 */
export function useMetadata() {
  const dispatch = useAppDispatch();

  const classes   = useAppSelector((s) => s.metadata.classes);
  const rows      = useAppSelector((s) => s.metadata.rows);
  const documents = useAppSelector((s) => s.metadata.documents);
  const activeRow = useAppSelector((s) => s.metadata.activeRow);
  const update    = useAppSelector((s) => s.metadata.update);

  // ──────────────────────────────────────────────
  // 1) Lister les classes metadata + nb d'enregistrements
  //    GET /api/docs/metadata/global
  // ──────────────────────────────────────────────
  const fetchClasses = useCallback(async () => {
    dispatch(setClassesLoading());
    try {
      const data = await fetchAuth('/docs/metadata/global') as MetadataGlobalResponse;
      dispatch(setClassesData(data));
      return data;
    } catch (err: any) {
      dispatch(setClassesError(err.message || 'Erreur lors du chargement des classes'));
      return null;
    }
  }, [dispatch]);

  // ──────────────────────────────────────────────
  // 2) Lister les lignes d'une table metadata (dynamique) avec pagination
  //    GET /api/docs/metadata?class=CV&offset=0&limit=50
  // ──────────────────────────────────────────────
  const fetchMetadataRows = useCallback(async (
    className: string,
    params?: { offset?: number; limit?: number }
  ) => {
    const offset = params?.offset ?? 0;
    const limit = params?.limit ?? 50;

    dispatch(setRowsLoading());
    try {
      const data = await fetchAuth(
        `/docs/metadata?class=${encodeURIComponent(className)}&offset=${offset}&limit=${limit}`
      ) as MetadataPaginatedResponse<MetadataRow>;

      dispatch(setRowsData({ ...data, className }));
      return data;
    } catch (err: any) {
      dispatch(setRowsError(err.message || 'Erreur lors du chargement des métadonnées'));
      return null;
    }
  }, [dispatch]);

  // ──────────────────────────────────────────────
  // 3) Mettre à jour une ligne metadata
  //    PUT /api/docs/metadata?class=CV&metadataId=<guid>
  //    Body: { "Nom": "BAH", "Prénom": "IBRAHIM" }
  // ──────────────────────────────────────────────
  const updateMetadataRow = useCallback(async (
    className: string,
    metadataId: string,
    fields: Record<string, any>
  ): Promise<MetadataUpdateResponse | null> => {
    dispatch(setUpdateLoading());
    try {
      const data = await fetchAuth(
        `/docs/metadata?class=${encodeURIComponent(className)}&metadataId=${encodeURIComponent(metadataId)}`,
        {
          method: 'PUT',
          body: JSON.stringify(fields),
        }
      ) as MetadataUpdateResponse;

      dispatch(setUpdateSuccess());
      return data;
    } catch (err: any) {
      dispatch(setUpdateError(err.message || 'Erreur lors de la mise à jour'));
      return null;
    }
  }, [dispatch]);

  // ──────────────────────────────────────────────
  // 4) Récupérer les documents liés à une classe metadata
  //    GET /api/docs/documents?class=CV&offset=0&limit=50
  // ──────────────────────────────────────────────
  const fetchClassDocuments = useCallback(async (
    className: string,
    params?: { offset?: number; limit?: number }
  ) => {
    const offset = params?.offset ?? 0;
    const limit = params?.limit ?? 50;

    dispatch(setDocumentsLoading());
    try {
      const data = await fetchAuth(
        `/docs/documents?class=${encodeURIComponent(className)}&offset=${offset}&limit=${limit}`
      ) as MetadataPaginatedResponse<MetadataDocument>;

      dispatch(setDocumentsData({ ...data, className }));
      return data;
    } catch (err: any) {
      dispatch(setDocumentsError(err.message || 'Erreur lors du chargement des documents'));
      return null;
    }
  }, [dispatch]);

  // ──────────────────────────────────────────────
  // 5) Récupérer une metadata précise par DocumentId
  //    GET /api/docs/metadata/by-class-documentid?class=CV&documentId=<guid>
  // ──────────────────────────────────────────────
  const fetchMetadataByDocumentId = useCallback(async (
    className: string,
    documentId: string
  ) => {
    dispatch(setActiveRowLoading());
    try {
      const data = await fetchAuth(
        `/docs/metadata/by-class-documentid?class=${encodeURIComponent(className)}&documentId=${encodeURIComponent(documentId)}`
      ) as MetadataByDocumentIdResponse;

      dispatch(setActiveRowData(data.row));
      return data.row;
    } catch (err: any) {
      // 404 = aucune metadata trouvée → pas une vraie erreur
      if (err.message?.includes('404') || err.message?.includes('Aucune metadata')) {
        dispatch(setActiveRowData(null));
        return null;
      }
      dispatch(setActiveRowError(err.message || 'Erreur lors du chargement de la metadata'));
      return null;
    }
  }, [dispatch]);

  return {
    // State
    classes,
    rows,
    documents,
    activeRow,
    update,

    // Actions
    fetchClasses,
    fetchMetadataRows,
    updateMetadataRow,
    fetchClassDocuments,
    fetchMetadataByDocumentId,

    // Clears
    clearRows: () => dispatch(clearRows()),
    clearDocuments: () => dispatch(clearDocuments()),
    clearActiveRow: () => dispatch(clearActiveRow()),
  };
}
