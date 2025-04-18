// src/redux/features/userSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import { api } from "../api";
import { Address, User } from "@/types";

interface UserState {
  profile: User | null;
  addresses: Address[];
  defaultAddress: Address | null;
}

const initialState: UserState = {
  profile: null,
  addresses: [],
  defaultAddress: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      api.endpoints.getProfile.matchFulfilled,
      (state, { payload }) => {
        state.profile = payload;
      }
    );
    builder.addMatcher(
      api.endpoints.getAddresses.matchFulfilled,
      (state, { payload }) => {
        state.addresses = payload;
      }
    );
    builder.addMatcher(
      api.endpoints.addAddress.matchFulfilled,
      (state, { payload }) => {
        state.addresses.push(payload);
      }
    );
    builder.addMatcher(
      api.endpoints.updateProfile.matchFulfilled,
      (state, { payload }) => {
        state.profile = payload;
      }
    );
    builder.addMatcher(
      api.endpoints.updateAddress.matchFulfilled,
      (state, { payload }) => {
        const index = state.addresses.findIndex(
          (address) => address._id === payload.id
        );
        if (index !== -1) {
          state.addresses[index] = payload;
        }
      }
    );
    builder.addMatcher(
      api.endpoints.deleteAddress.matchFulfilled,
      (state, { payload }) => {
        state.addresses = state.addresses.filter(
          (address) => address._id !== payload.id
        );
      }
    );
    builder.addMatcher(
        api.endpoints.setDefaultAddress.matchFulfilled,
        (state, { payload }) => {
            state.defaultAddress = payload;
            }
    );
    builder.addMatcher(
        api.endpoints.getDefaultAddress.matchFulfilled,
        (state, { payload }) => {
            state.defaultAddress = payload;
        }
        );
  },
});

export default userSlice.reducer;
