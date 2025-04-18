import { createSlice } from "@reduxjs/toolkit";
import { api } from "../api";
import { CartItem, Review, Order } from "@/types";

interface BuyerState {
  cart: CartItem[];
  wishlist: string[];
  reviews: Review[];
  orders: Order[];
}

const initialState: BuyerState = {
  cart: [],
  wishlist: [],
  reviews: [],
  orders: [],
};

const buyerSlice = createSlice({
  name: "buyer",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Cart
    builder.addMatcher(api.endpoints.getCart.matchFulfilled, (state, { payload }) => {
      state.cart = payload;
    });
    builder.addMatcher(api.endpoints.addToCart.matchFulfilled, (state, { payload }) => {
      state.cart = payload;
    });
    builder.addMatcher(api.endpoints.updateCart.matchFulfilled, (state, { payload }) => {
      state.cart = payload;
    });
    builder.addMatcher(api.endpoints.removeFromCart.matchFulfilled, (state, { payload }) => {
      state.cart = payload;
    });
    builder.addMatcher(api.endpoints.clearCart.matchFulfilled, (state, { payload }) => {
      state.cart = payload;
    });

    // Wishlist
    builder.addMatcher(api.endpoints.getWishlist.matchFulfilled, (state, { payload }) => {
      state.wishlist = payload;
    });
    builder.addMatcher(api.endpoints.addToWishlist.matchFulfilled, (state, { payload }) => {
      state.wishlist = payload;
    });
    builder.addMatcher(api.endpoints.removeFromWishlist.matchFulfilled, (state, { payload }) => {
      state.wishlist = payload;
    });
    builder.addMatcher(api.endpoints.clearWishlist.matchFulfilled, (state, { payload }) => {
      state.wishlist = payload;
    });

    // Reviews
    builder.addMatcher(api.endpoints.getUserReviews.matchFulfilled, (state, { payload }) => {
      state.reviews = payload;
    });
    builder.addMatcher(api.endpoints.getReviewById.matchFulfilled, (state, { payload }) => {
      const index = state.reviews.findIndex((r) => r._id === payload._id);
      if (index !== -1) {
        state.reviews[index] = payload;
      } else {
        state.reviews.push(payload);
      }
    });
    builder.addMatcher(api.endpoints.addReview.matchFulfilled, (state, { payload }) => {
      state.reviews.push(payload);
    });
    builder.addMatcher(api.endpoints.updateReview.matchFulfilled, (state, { payload }) => {
      const index = state.reviews.findIndex((r) => r._id === payload._id);
      if (index !== -1) {
        state.reviews[index] = payload;
      }
    });
    builder.addMatcher(api.endpoints.deleteReview.matchFulfilled, (state, { meta }) => {
      const reviewId = meta.arg.originalArgs;
      state.reviews = state.reviews.filter((r) => r._id !== reviewId);
    });

    // Orders
    builder.addMatcher(api.endpoints.getBuyerOrders.matchFulfilled, (state, { payload }) => {
      state.orders = payload;
    });
    builder.addMatcher(api.endpoints.checkout.matchFulfilled, (state, { payload }) => {
      state.orders.push(payload);
    });
    builder.addMatcher(api.endpoints.createSingleProductOrder.matchFulfilled, (state, { payload }) => {
      state.orders.push(payload);
    });
    builder.addMatcher(api.endpoints.verifyPayment.matchFulfilled, (state, { meta }) => {
      const orderId = meta.arg.originalArgs.orderId;
      const orderIndex = state.orders.findIndex((o) => o._id === orderId);
      if (orderIndex !== -1) {
        state.orders[orderIndex] = {
          ...state.orders[orderIndex],
          paymentStatus: 'completed',
          status: 'processing',
        };
      }
    });
    builder.addMatcher(api.endpoints.markCODCollected.matchFulfilled, (state, { meta }) => {
      const orderId = meta.arg.originalArgs;
      const orderIndex = state.orders.findIndex((o) => o._id === orderId);
      if (orderIndex !== -1) {
        state.orders[orderIndex] = {
          ...state.orders[orderIndex],
          paymentStatus: 'completed',
        };
      }
    });
  },
});

export default buyerSlice.reducer;