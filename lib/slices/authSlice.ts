import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Admin } from '@/types/auth';

interface AuthState {
  admin: Admin | null;
  isAuthenticated: boolean;
  token: string | null;
}

// Hydrate from localStorage on load
function getInitialToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('resvor_admin_token');
}

const initialState: AuthState = {
  admin: null,
  isAuthenticated: !!getInitialToken(),
  token: getInitialToken(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ admin: Admin; token: string }>
    ) => {
      state.admin = action.payload.admin;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    setAdmin: (state, action: PayloadAction<Admin>) => {
      state.admin = action.payload;
    },
    logout: (state) => {
      state.admin = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, setAdmin, logout } = authSlice.actions;
export default authSlice.reducer;