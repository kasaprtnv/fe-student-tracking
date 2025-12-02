import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchUserProfile, login, logout, validateToken } from './auth.thunks';
import { AuthState } from '@/types/auth';
import { User } from '@/types/user';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  initialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearAuthError(state) {
      state.error = null;
    },
    logoutLocal(state) {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.receivedData;
        state.error = null;
        state.initialized = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
        state.initialized = true;
      });
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Logout failed';
      });
    builder
      .addCase(validateToken.fulfilled, (state, action) => {
        state.isAuthenticated = action.payload.success;
        state.initialized = true;
      })
      .addCase(validateToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.initialized = true;
      });
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.user = action.payload.data;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
        state.initialized = true;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user profile';
        state.initialized = true;
      });
  },
});

export const { setUser, clearAuthError, logoutLocal } = authSlice.actions;
export default authSlice.reducer;
