import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import docsReducer from './docs/docsSlice';
import adminReducer from './admin/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    docs: docsReducer,
    admin: adminReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
