import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import docsReducer from './docs/docsSlice';
import adminReducer from './admin/adminSlice';
import instructionReducer from './instruction/instructionSlice';

import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';

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

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
