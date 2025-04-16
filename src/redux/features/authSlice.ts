// src/redux/features/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { api } from "../api";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  user: { id: string; name: string; email: string; role: string } | null;
  loginSuccess: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  user: null,
  loginSuccess: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
    },
    setUser: (state, action: PayloadAction<{ id: string; name: string; email: string; role: string }>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setLoginSuccess: (state) => {
      state.loginSuccess = true;
    },
    resetLoginSuccess: (state) => {
      state.loginSuccess = false;
    },
    clearAuth: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.user = null;
      state.loginSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(api.endpoints.login.matchFulfilled, (state, { payload }) => {
      state.user = payload.user;
      state.isAuthenticated = true;
      state.loginSuccess = true;
    });
    builder.addMatcher(api.endpoints.logout.matchFulfilled, (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.user = null;
      state.loginSuccess = false;
    });
    builder.addMatcher(api.endpoints.refreshToken.matchFulfilled, (state, { payload }) => {
      state.accessToken = payload.accessToken;
    });
  },
});

export const { setTokens, setUser, setLoginSuccess, resetLoginSuccess, clearAuth } = authSlice.actions;
export default authSlice.reducer;