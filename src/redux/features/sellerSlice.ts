import { createSlice } from "@reduxjs/toolkit";
import { api } from "../api";
import { Product, Order, SellerAnalytics } from "@/types";

interface SellerState {
  products: Product[];
  orders: Order[];
  analytics: SellerAnalytics | null;
  productImages: { [productId: string]: string[] };
}

const initialState: SellerState = {
  products: [],
  orders: [],
  analytics: null,
  productImages: {},
};

const sellerSlice = createSlice({
  name: "seller",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Queries
    builder.addMatcher(
      api.endpoints.getSellerProducts.matchFulfilled,
      (state, { payload }) => {
        state.products = payload;
      }
    );
    builder.addMatcher(
      api.endpoints.getSellerOrders.matchFulfilled,
      (state, { payload }) => {
        state.orders = payload;
      }
    );
    builder.addMatcher(
      api.endpoints.getSellerAnalytics.matchFulfilled,
      (state, { payload }) => {
        state.analytics = payload;
      }
    );
    builder.addMatcher(
      api.endpoints.getProductImages.matchFulfilled,
      (state, { meta, payload }) => {
        const productId = meta.arg.originalArgs;
        state.productImages[productId] = payload;
      }
    );

    // Mutations
    builder.addMatcher(
      api.endpoints.createProduct.matchFulfilled,
      (state, { payload }) => {
        state.products = [...state.products, payload];
      }
    );
    builder.addMatcher(
      api.endpoints.updateProduct.matchFulfilled,
      (state, { payload }) => {
        state.products = state.products.map((product) =>
          product._id === payload._id ? payload : product
        );
      }
    );
    builder.addMatcher(
      api.endpoints.deleteProduct.matchFulfilled,
      (state, { meta }) => {
        const productId = meta.arg.originalArgs;
        state.products = state.products.filter((product) => product._id !== productId);
        delete state.productImages[productId]; // Clean up images for deleted product
      }
    );
    builder.addMatcher(
      api.endpoints.uploadProductImage.matchFulfilled,
      (state, { meta, payload }) => {
        const productId = meta.arg.originalArgs.productId;
        state.products = state.products.map((product) =>
          product._id === productId ? payload : product
        );
        state.productImages[productId] = payload.images; // Update images
      }
    );
    builder.addMatcher(
      api.endpoints.deleteProductImage.matchFulfilled,
      (state, { meta, payload }) => {
        const productId = meta.arg.originalArgs.productId;
        state.products = state.products.map((product) =>
          product._id === productId ? payload : product
        );
        state.productImages[productId] = payload.images; // Update images
      }
    );
    builder.addMatcher(
      api.endpoints.updateOrderStatus.matchFulfilled,
      (state, { payload }) => {
        state.orders = state.orders.map((order) =>
          order._id === payload._id ? payload : order
        );
      }
    );
  },
});

export default sellerSlice.reducer;