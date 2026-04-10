import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { UploadResponse } from '../../types/documents';

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
}

// Récupération initiale depuis localStorage
const loadInitialState = (): DocsState => {
  try {
    const saved = localStorage.getItem('docs_state');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load docs state from localStorage", e);
  }
  return {
    stagedFiles: [],
    activeSessions: {},
  };
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
    updateSessionStatus: (state, action: PayloadAction<{id: string, update: Partial<UploadResponse>}>) => {
      const session = state.activeSessions[action.payload.id];
      if (session) {
        state.activeSessions[action.payload.id] = { ...session, ...action.payload.update };
        localStorage.setItem('docs_state', JSON.stringify(state));
      }
    }
  },
});

export const { 
  setStagedFiles, 
  addStagedFile, 
  removeStagedFile, 
  clearStagedFiles, 
  setSession, 
  removeSession,
  updateSessionStatus
} = docsSlice.actions;

export default docsSlice.reducer;
