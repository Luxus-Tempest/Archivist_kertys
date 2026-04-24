import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AdminState, AdminUsersResponse } from '../../types/admin';
import i18next from 'i18next';

const API_URL = import.meta.env.VITE_BASE_URL + '/admin';

const initialState: AdminState = {
  users: [],
  totalCount: 0,
  offset: 0,
  limit: 10,
  isLoading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk<
  AdminUsersResponse,
  { limit?: number; offset?: number },
  { rejectValue: string }
>('admin/fetchUsers', async ({ limit = 10, offset = 0 }, thunkAPI) => {
  try {
    const token = (thunkAPI.getState() as any).auth.token;
    if (!token) return thunkAPI.rejectWithValue('No token found');

    const url = `${API_URL}/users?limit=${limit}&offset=${offset}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': i18next.t('bearerToken', 'Bearer {{token}}', { token })
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return thunkAPI.rejectWithValue(errorData.message || 'Erreur lors de la récupération des utilisateurs.');
    }

    return await response.json();
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || 'Erreur de connexion au serveur.');
  }
});

export const updateUserStatus = createAsyncThunk<
  { id: string; status: string },
  { userId: string; status: string },
  { rejectValue: string }
>('admin/updateUserStatus', async ({ userId, status }, thunkAPI) => {
  try {
    const token = (thunkAPI.getState() as any).auth.token;
    if (!token) return thunkAPI.rejectWithValue('No token found');

    const response = await fetch(`${API_URL}/users/${userId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': i18next.t('bearerToken', 'Bearer {{token}}', { token })
      },
      body: JSON.stringify({ Status: status }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return thunkAPI.rejectWithValue(errorData.message || 'Erreur lors de la mise à jour du statut.');
    }

    return { id: userId, status };
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || 'Erreur de connexion au serveur.');
  }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUsers.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      state.isLoading = false;
      state.users = action.payload.users;
      state.totalCount = action.payload.totalCount;
      state.offset = action.payload.offset;
      state.limit = action.payload.limit;
      state.error = null;
    });
    builder.addCase(fetchUsers.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Erreur inconnue';
    });

    // Update User Status
    builder.addCase(updateUserStatus.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateUserStatus.fulfilled, (state, action) => {
      state.isLoading = false;
      state.error = null;
      const user = state.users.find((u) => u.id === action.payload.id);
      if (user) {
        user.status = action.payload.status as any;
      }
    });
    builder.addCase(updateUserStatus.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Erreur inconnue';
    });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
