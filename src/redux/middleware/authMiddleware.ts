import { api } from "../api";
import { clearAuth, setTokens, setUser, setLoading, setRefreshing } from "../features/authSlice";

// Session-scoped flag to prevent repeated auth checks within a session
let hasAuthBeenChecked = false;

// Debounce refresh token calls to prevent rapid retries (e.g., within 1 second)
let lastRefreshAttempt = 0;
const REFRESH_DEBOUNCE_MS = 1000;

// Access token lifetime (15 minutes) and refresh threshold (1 minute before expiry)
const ACCESS_TOKEN_LIFETIME_MS = 15 * 60 * 1000; // 15 minutes
const REFRESH_THRESHOLD_MS = 1 * 60 * 1000; // 1 minute before expiry
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const authMiddleware = (store: any) => (next: any) => async (action: any) => {
  const state = store.getState();
  const now = Date.now();

  const checkAuthStatus = async () => {
    if (hasAuthBeenChecked) return state.auth.isAuthenticated;

    try {
      const result = await store.dispatch(
        api.endpoints.getProfile.initiate(undefined, { forceRefetch: true })
      ).unwrap();
      store.dispatch(setUser(result));
      hasAuthBeenChecked = true;
      return true;
    } catch (error) {
      console.error("Auth check failed:", error);
      store.dispatch(clearAuth());
      hasAuthBeenChecked = true;
      return false;
    }
  };

  const refreshAccessToken = async () => {
    if (now - lastRefreshAttempt < REFRESH_DEBOUNCE_MS) {
      return false;
    }
    lastRefreshAttempt = now;

    try {
      const result = await store.dispatch(api.endpoints.refreshToken.initiate(undefined)).unwrap();
      store.dispatch(
        setTokens({
          accessToken: result.accessToken,
          refreshToken: state.auth.refreshToken || result.refreshToken || "",
        })
      );
      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      store.dispatch(clearAuth());
      return false;
    }
  };

  // Check if token needs refreshing based on issuedAt
  const shouldRefreshToken = () => {
    if (!state.auth.issuedAt || !state.auth.refreshToken || state.auth.isRefreshing) {
      return false;
    }
    const timeSinceIssued = now - state.auth.issuedAt;
    return timeSinceIssued > ACCESS_TOKEN_LIFETIME_MS - REFRESH_THRESHOLD_MS;
  };

  // Handle initial auth check
  if (action.type === "auth/INIT_AUTH") {
    store.dispatch(setLoading(true));
    const isAuthenticated = await checkAuthStatus();
    if (!isAuthenticated && state.auth.refreshToken) {
      await refreshAccessToken();
      await checkAuthStatus();
    }
    store.dispatch(setLoading(false));
    return next(action);
  }

  // Handle successful login
  if (api.endpoints.login.matchFulfilled(action)) {
    store.dispatch(setLoading(true));
    hasAuthBeenChecked = false;
    await checkAuthStatus();
    store.dispatch(setLoading(false));
  }

  // Handle successful logout
  if (api.endpoints.logout.matchFulfilled(action)) {
    store.dispatch(clearAuth());
    hasAuthBeenChecked = false;
  }

  // Handle successful token refresh
  if (api.endpoints.refreshToken.matchFulfilled(action)) {
    hasAuthBeenChecked = false;
    await checkAuthStatus();
  }

  // Handle 401 errors
  if (
    action.type.includes("rejected") &&
    action.payload?.status === 401 &&
    !state.auth.isRefreshing &&
    state.auth.refreshToken
  ) {
    store.dispatch(setRefreshing(true));
    const refreshed = await refreshAccessToken();
    store.dispatch(setRefreshing(false));

    if (refreshed && action.meta?.arg?.endpointName) {
      return store.dispatch({
        type: action.meta.arg.endpointName + "/executeQuery",
        payload: action.meta.arg,
      });
    } else {
      store.dispatch(clearAuth());
    }
  }

  // Proactively refresh token if nearing expiry
  if (shouldRefreshToken()) {
    store.dispatch(setRefreshing(true));
    await refreshAccessToken();
    store.dispatch(setRefreshing(false));
  }

  return next(action);
};