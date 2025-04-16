// src/redux/features/userSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import { api } from "../api";
import { Address, User } from "@/types";

interface UserState {
  profile: User | null;
  addresses: Address[];
}

const initialState: UserState = {
  profile: null,
  addresses: [],
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(api.endpoints.getProfile.matchFulfilled, (state, { payload }) => {
      state.profile = payload;
    });
    builder.addMatcher(api.endpoints.getAddresses.matchFulfilled, (state, { payload }) => {
      state.addresses = payload;
    });
    builder.addMatcher(api.endpoints.addAddress.matchFulfilled, (state, { payload }) => {
      state.addresses.push(payload);
    });
    builder.addMatcher(api.endpoints.updateProfile.matchFulfilled, (state, { payload }) => {
      state.profile = payload;
    });
  },
});

export default userSlice.reducer;