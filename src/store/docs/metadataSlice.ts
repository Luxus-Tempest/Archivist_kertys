import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

// --- Types ---

/** Une classe metadata (folder) retournée par GET /api/docs/metadata/global */
export interface MetadataClass {
  id: number;
  name: string;
  technicalName: string;
  totalRecords: number;
}

/** Réponse du endpoint global */
export interface MetadataGlobalResponse {
  totalCount: number;
  folders: MetadataClass[];
}

/** Une ligne de metadata quelconque (clés dynamiques) */
export type MetadataRow = Record<string, any>;

/** Réponse paginée pour les lignes ou les documents */
export interface MetadataPaginatedResponse<T> {
  totalCount: number;
  offset: number;
  limit: number;
  page: string;
  rows: T[];
}

/** Un document lié à une classe metadata */
export interface MetadataDocument {
  documentId: string;
  originalFileName: string;
  extension: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
  createdAt: string;
  updatedAt: string;
  status?: string;
  me?: boolean;
  user?: { fullName: string; email: string } | null;
}

/** Réponse pour metadata par DocumentId */
export interface MetadataByDocumentIdResponse {
  row: MetadataRow;
}

/** Réponse de mise à jour */
export interface MetadataUpdateResponse {
  updated: number;
}

// --- Slice State ---

interface MetadataState {
  // Classes (global)
  classes: {
    data: MetadataClass[];
    totalCount: number;
    isLoading: boolean;
    error: string | null;
  };
  // Lignes d'une table metadata
  rows: {
    data: MetadataRow[];
    totalCount: number;
    offset: number;
    limit: number;
    currentClass: string | null;
    isLoading: boolean;
    error: string | null;
  };
  // Documents liés à une classe
  documents: {
    data: MetadataDocument[];
    totalCount: number;
    offset: number;
    limit: number;
    currentClass: string | null;
    isLoading: boolean;
    error: string | null;
  };
  // Metadata d'un document précis
  activeRow: {
    data: MetadataRow | null;
    isLoading: boolean;
    error: string | null;
  };
  // État de mise à jour
  update: {
    isUpdating: boolean;
    error: string | null;
  };
}

const initialState: MetadataState = {
  classes: {
    data: [],
    totalCount: 0,
    isLoading: false,
    error: null,
  },
  rows: {
    data: [],
    totalCount: 0,
    offset: 0,
    limit: 50,
    currentClass: null,
    isLoading: false,
    error: null,
  },
  documents: {
    data: [],
    totalCount: 0,
    offset: 0,
    limit: 50,
    currentClass: null,
    isLoading: false,
    error: null,
  },
  activeRow: {
    data: null,
    isLoading: false,
    error: null,
  },
  update: {
    isUpdating: false,
    error: null,
  },
};

export const metadataSlice = createSlice({
  name: 'metadata',
  initialState,
  reducers: {
    // ── Classes (global) ──
    setClassesLoading: (state) => {
      state.classes.isLoading = true;
      state.classes.error = null;
    },
    setClassesData: (state, action: PayloadAction<MetadataGlobalResponse>) => {
      state.classes.isLoading = false;
      state.classes.data = action.payload.folders;
      state.classes.totalCount = action.payload.totalCount;
    },
    setClassesError: (state, action: PayloadAction<string>) => {
      state.classes.isLoading = false;
      state.classes.error = action.payload;
    },

    // ── Rows (table dynamique) ──
    setRowsLoading: (state) => {
      state.rows.isLoading = true;
      state.rows.error = null;
    },
    setRowsData: (state, action: PayloadAction<MetadataPaginatedResponse<MetadataRow> & { className: string }>) => {
      state.rows.isLoading = false;
      state.rows.data = action.payload.rows;
      state.rows.totalCount = action.payload.totalCount;
      state.rows.offset = action.payload.offset;
      state.rows.limit = action.payload.limit;
      state.rows.currentClass = action.payload.className;
    },
    setRowsError: (state, action: PayloadAction<string>) => {
      state.rows.isLoading = false;
      state.rows.error = action.payload;
    },
    clearRows: (state) => {
      state.rows = initialState.rows;
    },

    // ── Documents ──
    setDocumentsLoading: (state) => {
      state.documents.isLoading = true;
      state.documents.error = null;
    },
    setDocumentsData: (state, action: PayloadAction<MetadataPaginatedResponse<MetadataDocument> & { className: string }>) => {
      state.documents.isLoading = false;
      state.documents.data = action.payload.rows;
      state.documents.totalCount = action.payload.totalCount;
      state.documents.offset = action.payload.offset;
      state.documents.limit = action.payload.limit;
      state.documents.currentClass = action.payload.className;
    },
    setDocumentsError: (state, action: PayloadAction<string>) => {
      state.documents.isLoading = false;
      state.documents.error = action.payload;
    },
    clearDocuments: (state) => {
      state.documents = initialState.documents;
    },

    // ── Active Row (par DocumentId) ──
    setActiveRowLoading: (state) => {
      state.activeRow.isLoading = true;
      state.activeRow.error = null;
    },
    setActiveRowData: (state, action: PayloadAction<MetadataRow | null>) => {
      state.activeRow.isLoading = false;
      state.activeRow.data = action.payload;
    },
    setActiveRowError: (state, action: PayloadAction<string>) => {
      state.activeRow.isLoading = false;
      state.activeRow.error = action.payload;
    },
    clearActiveRow: (state) => {
      state.activeRow = initialState.activeRow;
    },

    // ── Update ──
    setUpdateLoading: (state) => {
      state.update.isUpdating = true;
      state.update.error = null;
    },
    setUpdateSuccess: (state) => {
      state.update.isUpdating = false;
      state.update.error = null;
    },
    setUpdateError: (state, action: PayloadAction<string>) => {
      state.update.isUpdating = false;
      state.update.error = action.payload;
    },
  },
});

export const {
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
} = metadataSlice.actions;

export default metadataSlice.reducer;
