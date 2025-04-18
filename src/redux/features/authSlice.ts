//src/redux/features/authSlice.ts
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
  issuedAt: number | null; // Timestamp (ms) when access token was issued
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  user: null,
  loading: true,
  isRefreshing: false,
  issuedAt: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.issuedAt = Date.now(); // Set issuedAt when tokens are updated
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
      state.issuedAt = null; // Clear issuedAt on logout
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
      state.issuedAt = Date.now(); // Set issuedAt on login
    });
    builder.addMatcher(api.endpoints.logout.matchFulfilled, (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
      state.issuedAt = null; // Clear issuedAt on logout
    });
    builder.addMatcher(api.endpoints.refreshToken.matchFulfilled, (state, { payload }) => {
      state.accessToken = payload.accessToken;
      state.isRefreshing = false;
      state.issuedAt = Date.now(); // Set issuedAt on refresh
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