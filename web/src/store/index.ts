import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import pdsReducer from './slices/pdsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    pds: pdsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
