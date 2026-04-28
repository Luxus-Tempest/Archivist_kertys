import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AuthState, LoginResponse, User, CreateOrganizationPayload, RegisterInvitedUserPayload } from '../../types/auth';
import type { LoginFormData, SignupFormData } from '../../utils/validations';
import i18next from 'i18next'


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
      const errorData = await response.json().catch(() => ({}));
      return thunkAPI.rejectWithValue(errorData.message || 'Erreur lors de la création du compte.');
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return { message: 'Signup successful' } as any;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || 'Erreur de connexion au serveur.');
  }
});

export const createOrganization = createAsyncThunk<
  { message: string },
  CreateOrganizationPayload,
  { rejectValue: string }
>('auth/createOrganization', async (data, thunkAPI) => {
  try {
    const response = await fetch(`${API_URL}/organization`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return thunkAPI.rejectWithValue(errorData.message || 'Erreur lors de la création de l\'organisation.');
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return { message: 'Organization created successfully' } as any;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || 'Erreur de connexion au serveur.');
  }
});

export const registerInvitedUser = createAsyncThunk<
  { message: string },
  { data: RegisterInvitedUserPayload; token: string },
  { rejectValue: string }
>('auth/RegisterByInvitation', async ({ data, token }, thunkAPI) => {
  try {
    const response = await fetch(`${API_URL}/register-by-invitation`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'token': `${token}`
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return thunkAPI.rejectWithValue(errorData.message || 'Error during registration.');
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return { message: 'Registration successful' } as any;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || 'Server connection error.');
  }
});

export const fetchMe = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>('auth/me', async (_, thunkAPI) => {
  try {
    const token = (thunkAPI.getState() as any).auth.token;
    if (!token) return thunkAPI.rejectWithValue('No token found');

    const response = await fetch(`${API_URL}/me`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': i18next.t('bearerToken', 'Bearer {{token}}', { token })
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return thunkAPI.rejectWithValue(errorData.message || 'Erreur lors de la récupération du profil.');
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    throw new Error('Format de réponse invalide du serveur.');
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
      const errorData = await response.json().catch(() => ({}));
      return thunkAPI.rejectWithValue(errorData.message || 'Email ou mot de passe incorrect.');
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    throw new Error('La réponse du serveur n\'est pas au format JSON.');
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

    // Create Organization
    builder.addCase(createOrganization.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createOrganization.fulfilled, (state) => {
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(createOrganization.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Erreur inconnue';
    });

    // Register Invited User
    builder.addCase(registerInvitedUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(registerInvitedUser.fulfilled, (state) => {
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(registerInvitedUser.rejected, (state, action) => {
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
    // FetchMe
    builder.addCase(fetchMe.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchMe.fulfilled, (state, action) => {
      state.isLoading = false;
      state.error = null;
      state.user = action.payload;
    });
    builder.addCase(fetchMe.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Erreur inconnue';
      // Si le token est invalide, on déconnecte
      if (action.payload === 'Unauthorized' || action.payload?.includes('token')) {
        state.user = null;
        state.token = null;
        localStorage.removeItem('token');
      }
    });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
