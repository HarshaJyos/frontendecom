// src/redux/features/analyticsSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import { api } from "../api";
import { AdminAnalytics, SellerAnalytics } from "@/types";

interface AnalyticsState {
  sellerAnalytics: SellerAnalytics | null;
  adminAnalytics: AdminAnalytics | null;
}

const initialState: AnalyticsState = {
  sellerAnalytics: null,
  adminAnalytics: null,
};

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      api.endpoints.getSellerAnalytics.matchFulfilled,
      (state, { payload }) => {
        state.sellerAnalytics = payload;
      }
    );
    builder.addMatcher(
      api.endpoints.getAdminAnalytics.matchFulfilled,
      (state, { payload }) => {
        state.adminAnalytics = payload;
      }
    );
  },
});

export default analyticsSlice.reducer;
