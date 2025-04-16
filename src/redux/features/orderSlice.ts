// src/redux/features/orderSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import { api } from "../api";
import { Order } from "@/types";

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(api.endpoints.getBuyerOrders.matchFulfilled, (state, { payload }) => {
      state.orders = payload;
    });
    builder.addMatcher(api.endpoints.getSellerOrders.matchFulfilled, (state, { payload }) => {
      state.orders = payload;
    });
    builder.addMatcher(api.endpoints.getDeliveryOrders.matchFulfilled, (state, { payload }) => {
      state.orders = payload;
    });
    builder.addMatcher(api.endpoints.getAdminOrders.matchFulfilled, (state, { payload }) => {
      state.orders = payload;
    });
    builder.addMatcher(api.endpoints.checkout.matchFulfilled, (state, { payload }) => {
      state.currentOrder = payload;
    });
  },
});

export default orderSlice.reducer;