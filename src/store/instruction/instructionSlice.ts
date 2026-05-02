import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Instruction, InstructionState, CreateInstructionPayload, FetchInstructionsResponse } from '../../types/instruction';
import i18next from 'i18next';

const API_URL = import.meta.env.VITE_BASE_URL + '/admin/instructions';

const initialState: InstructionState = {
  instructions: [],
  totalCount: 0,
  isLoading: false,
  isActionLoading: false,
  error: null,
};

export const fetchInstructions = createAsyncThunk<
  FetchInstructionsResponse,
  void,
  { rejectValue: string }
>('instruction/fetchInstructions', async (_, thunkAPI) => {
  try {
    const token = (thunkAPI.getState() as any).auth.token;
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return thunkAPI.rejectWithValue(errorData.message || 'Erreur lors de la récupération des instructions.');
    }

    return await response.json();
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || 'Erreur de connexion au serveur.');
  }
});

export const createInstruction = createAsyncThunk<
  Instruction,
  CreateInstructionPayload,
  { rejectValue: string }
>('instruction/createInstruction', async (payload, thunkAPI) => {
  try {
    const token = (thunkAPI.getState() as any).auth.token;
    const response = await fetch(API_URL + '/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return thunkAPI.rejectWithValue(errorData.message || 'Erreur lors de la création de l\'instruction.');
    }

    return await response.json();
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || 'Erreur de connexion au serveur.');
  }
});

export const updateInstruction = createAsyncThunk<
  Instruction,
  { id: string; payload: Partial<Instruction> },
  { rejectValue: string }
>('instruction/updateInstruction', async ({ id, payload }, thunkAPI) => {
  try {
    const token = (thunkAPI.getState() as any).auth.token;
    const response = await fetch(`${API_URL}/update?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        className: payload.className,
        content: payload.content
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return thunkAPI.rejectWithValue(errorData.message || 'Erreur lors de la mise à jour.');
    }

    return await response.json();
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || 'Erreur de connexion au serveur.');
  }
});

export const deleteInstruction = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('instruction/deleteInstruction', async (id, thunkAPI) => {
  try {
    const token = (thunkAPI.getState() as any).auth.token;
    const response = await fetch(`${API_URL}/delete?id=${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return thunkAPI.rejectWithValue(errorData.message || 'Erreur lors de la suppression.');
    }

    return id;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || 'Erreur de connexion au serveur.');
  }
});

export const fetchInstructionById = createAsyncThunk<
  Instruction,
  string,
  { rejectValue: string }
>('instruction/fetchInstructionById', async (id, thunkAPI) => {
  try {
    const token = (thunkAPI.getState() as any).auth.token;
    const response = await fetch(`${API_URL}/instruction?id=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return thunkAPI.rejectWithValue(errorData.message || 'Erreur lors de la récupération de l\'instruction.');
    }

    return await response.json();
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || 'Erreur de connexion au serveur.');
  }
});

const instructionSlice = createSlice({
  name: 'instruction',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchInstructions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInstructions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.instructions = action.payload.instructions;
        state.totalCount = action.payload.totalCount;
      })
      .addCase(fetchInstructions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch By ID
      .addCase(fetchInstructionById.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
      })
      .addCase(fetchInstructionById.fulfilled, (state, action) => {
        state.isActionLoading = false;
        // Optional: update the instruction in the list if it exists
        state.instructions = state.instructions.map((i) =>
          i.id === action.payload.id ? action.payload : i
        );
      })
      .addCase(fetchInstructionById.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload as string;
      })
      // Create
      .addCase(createInstruction.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
      })
      .addCase(createInstruction.fulfilled, (state, action) => {
        state.isActionLoading = false;
        state.instructions.unshift(action.payload);
      })
      .addCase(createInstruction.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload as string;
      })
      // Update
      .addCase(updateInstruction.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
      })
      .addCase(updateInstruction.fulfilled, (state, action) => {
        state.isActionLoading = false;
        state.instructions = state.instructions.map((i) =>
          i.id === action.payload.id ? action.payload : i
        );
      })
      .addCase(updateInstruction.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload as string;
      })
      // Delete
      .addCase(deleteInstruction.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
      })
      .addCase(deleteInstruction.fulfilled, (state, action) => {
        state.isActionLoading = false;
        state.instructions = state.instructions.filter((i) => i.id !== action.payload);
      })
      .addCase(deleteInstruction.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = instructionSlice.actions;
export default instructionSlice.reducer;
