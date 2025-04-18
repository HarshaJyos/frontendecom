// src/redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { api } from "./api";
import authReducer from "./features/authSlice";
import userReducer from "./features/userSlice";
import productReducer from "./features/productSlice";
import orderReducer from "./features/orderSlice";
import analyticsReducer from "./features/analyticsSlice";
import sellerReducer from "./features/sellerSlice";
import buyerReducer from "./features/buyerSlice";
import { authMiddleware } from "./middleware/authMiddleware";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    product: productReducer,
    order: orderReducer,
    analytics: analyticsReducer,
    seller: sellerReducer,
    buyer: buyerReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware, authMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;