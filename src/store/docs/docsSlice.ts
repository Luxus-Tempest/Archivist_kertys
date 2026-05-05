import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { ProcessingStatus } from '../../types/documents';
import type { UploadResponse, HistoryResponse, SessionInfo } from '../../types/documents';

export interface StagedFileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

interface DocsState {
  stagedFiles: StagedFileMetadata[];
  activeSessions: Record<string, UploadResponse>;
  history: {
    sessions: SessionInfo[];
    totalCount: number;
    isLoading: boolean;
    error: string | null;
  };
}

// Récupération initiale depuis localStorage
const loadInitialState = (): DocsState => {
  const defaultState: DocsState = {
    stagedFiles: [],
    activeSessions: {},
    history: {
      sessions: [],
      totalCount: 0,
      isLoading: false,
      error: null
    }
  };

  try {
    const saved = localStorage.getItem('docs_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge saved state with default state to ensure new properties are defined
      return {
        ...defaultState,
        ...parsed,
        activeSessions: {}, // On ne restaure pas les sessions du local, l'API doit piloter la récupération
        history: {
          ...defaultState.history,
          ...(parsed.history || {})
        }
      };
    }
  } catch (e) {
    console.error("Failed to load docs state from localStorage", e);
  }
  return defaultState;
};

const initialState: DocsState = loadInitialState();



export const docsSlice = createSlice({
  name: 'docs',
  initialState,
  reducers: {
    setStagedFiles: (state, action: PayloadAction<StagedFileMetadata[]>) => {
      state.stagedFiles = action.payload;
      // Sync with localStorage
      localStorage.setItem('docs_state', JSON.stringify(state));
    },
    addStagedFile: (state, action: PayloadAction<StagedFileMetadata>) => {
      state.stagedFiles.push(action.payload);
      localStorage.setItem('docs_state', JSON.stringify(state));
    },
    removeStagedFile: (state, action: PayloadAction<string>) => {
      state.stagedFiles = state.stagedFiles.filter(f => f.id !== action.payload);
      localStorage.setItem('docs_state', JSON.stringify(state));
    },
    clearStagedFiles: (state) => {
      state.stagedFiles = [];
      localStorage.setItem('docs_state', JSON.stringify(state));
    },
    setSession: (state, action: PayloadAction<UploadResponse>) => {
      state.activeSessions[action.payload.session.id] = action.payload;
      localStorage.setItem('docs_state', JSON.stringify(state));
    },
    removeSession: (state, action: PayloadAction<string>) => {
      delete state.activeSessions[action.payload];
      localStorage.setItem('docs_state', JSON.stringify(state));
    },
    initializeSessionsFromIds: (state, action: PayloadAction<string[]>) => {
      action.payload.forEach(id => {
        if (!state.activeSessions[id]) {
          state.activeSessions[id] = {
            message: "Synchronizing...",
            session: { id, status: 'Pending' },
            files: []
          };
        }
      });
      localStorage.setItem('docs_state', JSON.stringify(state));
    },
    updateSessionStatus: (state, action: PayloadAction<{id: string, update: Partial<UploadResponse>}>) => {
      const session = state.activeSessions[action.payload.id];
      const newSession = {
        ...(session || { message: '', session: { id: action.payload.id, status: '' }, files: [] }),
        ...action.payload.update
      };
      state.activeSessions[action.payload.id] = newSession as UploadResponse;
      localStorage.setItem('docs_state', JSON.stringify(state));
    },
    reconcilePendingSessions: (state, action: PayloadAction<string[]>) => {
      const pendingIds = new Set(action.payload);
      Object.keys(state.activeSessions).forEach(id => {
        const session = state.activeSessions[id];
        // If the session is not in the pending list and is not already in a terminal state,
        // we mark it as completed because it should have finished while we were offline.
        if (!pendingIds.has(id)) {
          const terminalStates: string[] = [ProcessingStatus.COMPLETED, ProcessingStatus.UPLOADED, ProcessingStatus.FAILED];
          if (!terminalStates.includes(session.session.status)) {
            session.session.status = ProcessingStatus.COMPLETED;
            // Optionally clear files status if needed, but the session status is the main trigger
          }
        }
      });
      localStorage.setItem('docs_state', JSON.stringify(state));
    },
    setHistoryLoading: (state) => {
      state.history.isLoading = true;
      state.history.error = null;
    },
    setHistoryData: (state, action: PayloadAction<HistoryResponse>) => {
      state.history.isLoading = false;
      // We always replace the sessions to support true page-by-page pagination
      state.history.sessions = action.payload.row;
      state.history.totalCount = action.payload.totalCount;
    },
    setHistoryError: (state, action: PayloadAction<string>) => {
      state.history.isLoading = false;
      state.history.error = action.payload;
    },
  },
});

export const { 
  setStagedFiles, 
  addStagedFile, 
  removeStagedFile, 
  clearStagedFiles, 
  setSession, 
  removeSession,
  initializeSessionsFromIds,
  updateSessionStatus,
  reconcilePendingSessions,
  setHistoryLoading,
  setHistoryData,
  setHistoryError,
} = docsSlice.actions;

export default docsSlice.reducer;
