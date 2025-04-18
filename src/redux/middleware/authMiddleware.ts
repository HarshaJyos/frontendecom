import { api } from "../api";
import { clearAuth, setTokens, setUser, setLoading, setRefreshing } from "../features/authSlice";

// Session-scoped flag to prevent repeated auth checks within a session
let hasAuthBeenChecked = false;

// Debounce refresh token calls to prevent rapid retries (e.g., within 1 second)
let lastRefreshAttempt = 0;
const REFRESH_DEBOUNCE_MS = 1000;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const authMiddleware = (store: any) => (next: any) => async (action: any) => {
    const state = store.getState();
  const now = Date.now();

  const checkAuthStatus = async () => {
    // Skip if already checked in this session
    if (hasAuthBeenChecked) return state.auth.isAuthenticated;

    try {
        const result = await store.dispatch(api.endpoints.getProfile.initiate(undefined, { forceRefetch: true })).unwrap();

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
    // Debounce refresh attempts
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
    hasAuthBeenChecked = false; // Reset for new login
    await checkAuthStatus();
    store.dispatch(setLoading(false));
  }

  // Handle successful logout
  if (api.endpoints.logout.matchFulfilled(action)) {
    store.dispatch(clearAuth());
    hasAuthBeenChecked = false; // Reset for next session
  }

  // Handle successful token refresh
  if (api.endpoints.refreshToken.matchFulfilled(action)) {
    hasAuthBeenChecked = false; // Allow profile check after refresh
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
      // Retry the original action only if it’s an API call
      return store.dispatch({
        type: action.meta.arg.endpointName + "/executeQuery",
        payload: action.meta.arg,
      });
    } else {
      // If refresh fails or no endpoint, clear auth to prevent loops
      store.dispatch(clearAuth());
    }
  }

  return next(action);
};