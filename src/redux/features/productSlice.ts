// src/redux/features/productSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import { api } from "../api";
import { Product } from "@/types";

interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  searchResults: Product[];
}

const initialState: ProductState = {
  products: [],
  currentProduct: null,
  searchResults: [],
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(api.endpoints.getProducts.matchFulfilled, (state, { payload }) => {
      state.products = payload;
    });
    builder.addMatcher(api.endpoints.getProduct.matchFulfilled, (state, { payload }) => {
      state.currentProduct = payload;
    });
    builder.addMatcher(api.endpoints.searchProducts.matchFulfilled, (state, { payload }) => {
      state.searchResults = payload;
    });
  },
});

export default productSlice.reducer;