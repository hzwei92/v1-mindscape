import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export interface AuthState {
  isInit: boolean;
  isValid: boolean;
  interval: ReturnType<typeof setInterval> | null;
}

const initialState: AuthState = {
  isInit: false,
  isValid: false,
  interval: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthState: (state, action: PayloadAction<AuthState>) => {
      return action.payload;
    },
  },
});

export const { setAuthState } = authSlice.actions;

export const selectAuthState = (state: RootState) => state.auth;

export default authSlice.reducer