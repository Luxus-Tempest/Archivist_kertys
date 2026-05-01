import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import docsReducer from './docs/docsSlice';
import adminReducer from './admin/adminSlice';
import instructionReducer from './instruction/instructionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    docs: docsReducer,
    admin: adminReducer,
    instruction: instructionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
