// src/redux/features/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { api } from "../api";
import { User } from "@/types";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  isRefreshing: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  user: null,
  loading: true,
  isRefreshing: false,
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
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearAuth: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.user = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setRefreshing: (state, action: PayloadAction<boolean>) => {
      state.isRefreshing = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(api.endpoints.login.matchFulfilled, (state, { payload }) => {
      state.accessToken = payload.accessToken;
      state.refreshToken = payload.refreshToken;
      state.user = payload.user;
      state.isAuthenticated = true;
      state.loading = false;
    });
    builder.addMatcher(api.endpoints.logout.matchFulfilled, (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
    });
    builder.addMatcher(api.endpoints.refreshToken.matchFulfilled, (state, { payload }) => {
      state.accessToken = payload.accessToken;
      state.isRefreshing = false;
    });
    builder.addMatcher(api.endpoints.getProfile.matchFulfilled, (state, { payload }) => {
      state.user = payload;
      state.isAuthenticated = true;
      state.loading = false;
    });
    builder.addMatcher(api.endpoints.getProfile.matchRejected, (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
    });
  },
});

export const { setTokens, setUser, clearAuth, setLoading, setRefreshing } = authSlice.actions;
export default authSlice.reducer;