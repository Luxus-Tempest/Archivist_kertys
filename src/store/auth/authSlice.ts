import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AuthState, LoginResponse } from '../../types/auth';
import type { LoginFormData, SignupFormData } from '../../utils/validations';


const API_URL = import.meta.env.VITE_BASE_URL + '/auth';

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,
};

export const signupUser = createAsyncThunk<
  { message: string },
  SignupFormData,
  { rejectValue: string }
>('auth/signup', async (data, thunkAPI) => {
  try {
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return thunkAPI.rejectWithValue(errorData.message || 'Erreur lors de la création du compte.');
    }
    return await response.json();
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || 'Erreur de connexion au serveur.');
  }
});

export const loginUser = createAsyncThunk<
  LoginResponse,
  LoginFormData,
  { rejectValue: string }
>('auth/login', async (data, thunkAPI) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return thunkAPI.rejectWithValue(errorData.message || 'Email ou mot de passe incorrect.');
    }
    return await response.json();
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || 'Erreur de connexion au serveur.');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Signup
    builder.addCase(signupUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(signupUser.fulfilled, (state) => {
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(signupUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Erreur inconnue';
    });

    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.error = null;
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('token', action.payload.token);
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Erreur inconnue';
    });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
