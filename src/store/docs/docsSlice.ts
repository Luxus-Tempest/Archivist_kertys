import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { UploadResponse, HistoryResponse, SessionInfo } from '../../types/documents';
import { fetchAuth } from '../../utils/api';

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

export const fetchHistory = createAsyncThunk<
  HistoryResponse,
  { offset?: number, limit?: number } | void,
  { rejectValue: string }
>('docs/fetchHistory', async (params, thunkAPI) => {
  try {
    const offset = params?.offset ?? 0;
    const limit = params?.limit ?? 10;
    const data = await fetchAuth(`/docs/user/sessions-infos?offset=${offset}&limit=${limit}`);
    return data as HistoryResponse;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message || "Failed to fetch history");
  }
});

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
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchHistory.pending, (state) => {
      state.history.isLoading = true;
      state.history.error = null;
    });
    builder.addCase(fetchHistory.fulfilled, (state, action: PayloadAction<HistoryResponse>) => {
      state.history.isLoading = false;
      if (action.payload.offset === 0) {
        state.history.sessions = action.payload.row;
      } else {
        // Concatenate new sessions, avoiding duplicates if any
        const existingIds = new Set(state.history.sessions.map(s => s.sessionId));
        const newSessions = action.payload.row.filter(s => !existingIds.has(s.sessionId));
        state.history.sessions = [...state.history.sessions, ...newSessions];
      }
      state.history.totalCount = action.payload.totalCount;
    });
    builder.addCase(fetchHistory.rejected, (state, action) => {
      state.history.isLoading = false;
      state.history.error = action.payload as string;
    });
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
  updateSessionStatus
} = docsSlice.actions;

export default docsSlice.reducer;
