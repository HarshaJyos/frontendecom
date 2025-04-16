// src/redux/api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "./store";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const api = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: ["User", "Product", "Order", "Analytics"],
  endpoints: (builder) => ({
    // Authentication
    register: builder.mutation({
      query: (data) => ({ url: "/auth/register", method: "POST", body: data }),
    }),
    login: builder.mutation({
      query: (data) => ({ url: "/auth/login", method: "POST", body: data }),
    }),
    logout: builder.mutation({
      query: () => ({ url: "/auth/logout", method: "POST" }),
    }),
    refreshToken: builder.mutation({
      query: () => ({ url: "/auth/refresh-token", method: "POST" }),
    }),
    forgotPassword: builder.mutation({
      query: (data) => ({ url: "/auth/forgot-password", method: "POST", body: data }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({ url: "/auth/reset-password", method: "POST", body: data }),
    }),
    verifyEmail: builder.mutation({
      query: (data) => ({ url: "/auth/verify-email", method: "POST", body: data }),
    }),
    activateAdmin: builder.mutation({
      query: (data) => ({ url: "/auth/activate-admin", method: "POST", body: data }),
    }),

    // User
    getProfile: builder.query({
      query: () => "/users/profile",
      providesTags: ["User"],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({ url: "/users/profile", method: "PATCH", body: data }),
      invalidatesTags: ["User"],
    }),
    getAddresses: builder.query({
      query: () => "/users/addresses",
      providesTags: ["User"],
    }),
    addAddress: builder.mutation({
      query: (data) => ({ url: "/users/addresses", method: "POST", body: data }),
      invalidatesTags: ["User"],
    }),

    // Buyer
    getCart: builder.query({
      query: () => "/buyer/cart",
      providesTags: ["User"],
    }),
    addToCart: builder.mutation({
      query: (data) => ({ url: "/buyer/cart", method: "POST", body: data }),
      invalidatesTags: ["User"],
    }),
    updateCart: builder.mutation({
      query: ({ itemId, quantity }) => ({ url: `/buyer/cart/${itemId}`, method: "PATCH", body: { quantity } }),
      invalidatesTags: ["User"],
    }),
    removeFromCart: builder.mutation({
      query: (itemId) => ({ url: `/buyer/cart/${itemId}`, method: "DELETE" }),
      invalidatesTags: ["User"],
    }),
    getWishlist: builder.query({
      query: () => "/buyer/wishlist",
      providesTags: ["User"],
    }),
    addToWishlist: builder.mutation({
      query: (data) => ({ url: "/buyer/wishlist", method: "POST", body: data }),
      invalidatesTags: ["User"],
    }),
    checkout: builder.mutation({
      query: (data) => ({ url: "/buyer/checkout", method: "POST", body: data }),
      invalidatesTags: ["Order", "User"],
    }),
    getBuyerOrders: builder.query({
      query: () => "/buyer/orders",
      providesTags: ["Order"],
    }),
    addReview: builder.mutation({
      query: (data) => ({ url: "/buyer/reviews", method: "POST", body: data }),
      invalidatesTags: ["Product"],
    }),

    // Seller
    createProduct: builder.mutation({
      query: (data) => ({ url: "/seller/products", method: "POST", body: data }),
      invalidatesTags: ["Product"],
    }),
    getSellerProducts: builder.query({
      query: (params) => ({ url: "/seller/products", params }),
      providesTags: ["Product"],
    }),
    updateProduct: builder.mutation({
      query: ({ productId, ...data }) => ({ url: `/seller/products/${productId}`, method: "PATCH", body: data }),
      invalidatesTags: ["Product"],
    }),
    deleteProduct: builder.mutation({
      query: (productId) => ({ url: `/seller/products/${productId}`, method: "DELETE" }),
      invalidatesTags: ["Product"],
    }),
    uploadProductImage: builder.mutation({
      query: ({ productId, formData }) => ({ url: `/seller/products/${productId}/upload-image`, method: "POST", body: formData }),
      invalidatesTags: ["Product"],
    }),
    getSellerOrders: builder.query({
      query: (params) => ({ url: "/seller/orders", params }),
      providesTags: ["Order"],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ orderId, status }) => ({ url: `/seller/orders/${orderId}/status`, method: "PATCH", body: { status } }),
      invalidatesTags: ["Order"],
    }),
    getSellerAnalytics: builder.query({
      query: () => "/seller/analytics",
      providesTags: ["Analytics"],
    }),

    // Delivery
    getDeliveryOrders: builder.query({
      query: (params) => ({ url: "/delivery/orders", params }),
      providesTags: ["Order"],
    }),
    updateDeliveryStatus: builder.mutation({
      query: ({ orderId, status }) => ({ url: `/delivery/orders/${orderId}/status`, method: "PATCH", body: { status } }),
      invalidatesTags: ["Order"],
    }),
    updateLocation: builder.mutation({
      query: ({ orderId, latitude, longitude }) => ({ url: `/delivery/orders/${orderId}/location`, method: "PATCH", body: { latitude, longitude } }),
      invalidatesTags: ["Order"],
    }),

    // Admin
    getUsers: builder.query({
      query: (params) => ({ url: "/admin/users", params }),
      providesTags: ["User"],
    }),
    approveSeller: builder.mutation({
      query: (sellerId) => ({ url: `/admin/sellers/${sellerId}/approve`, method: "PATCH" }),
      invalidatesTags: ["User"],
    }),
    approveDeliveryBoy: builder.mutation({
      query: (deliveryBoyId) => ({ url: `/admin/delivery/${deliveryBoyId}/approve`, method: "PATCH" }),
      invalidatesTags: ["User"],
    }),
    getAdminOrders: builder.query({
      query: (params) => ({ url: "/admin/orders", params }),
      providesTags: ["Order"],
    }),
    assignDeliveryBoy: builder.mutation({
      query: ({ orderId, deliveryBoyId }) => ({ url: `/admin/orders/${orderId}/assign-delivery`, method: "PATCH", body: { deliveryBoyId } }),
      invalidatesTags: ["Order"],
    }),
    updateAdminOrderStatus: builder.mutation({
      query: ({ orderId, status }) => ({ url: `/admin/orders/${orderId}/status`, method: "PATCH", body: { status } }),
      invalidatesTags: ["Order"],
    }),
    getAdminAnalytics: builder.query({
      query: () => "/admin/analytics",
      providesTags: ["Analytics"],
    }),

    // Products
    getProducts: builder.query({
      query: (params) => ({ url: "/products", params }),
      providesTags: ["Product"],
    }),
    searchProducts: builder.query({
      query: (params) => ({ url: "/products/search", params }),
      providesTags: ["Product"],
    }),
    getProduct: builder.query({
      query: (productId) => `/products/${productId}`,
      providesTags: ["Product"],
    }),

    // Payments
    createPaymentOrder: builder.mutation({
      query: (data) => ({ url: "/payments/create-order", method: "POST", body: data }),
    }),
    verifyPayment: builder.mutation({
      query: (data) => ({ url: "/payments/verify", method: "POST", body: data }),
    }),
    markCODCollected: builder.mutation({
      query: (orderId) => ({ url: `/payments/cod/${orderId}/mark-collected`, method: "PATCH" }),
      invalidatesTags: ["Order"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useActivateAdminMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetAddressesQuery,
  useAddAddressMutation,
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartMutation,
  useRemoveFromCartMutation,
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useCheckoutMutation,
  useGetBuyerOrdersQuery,
  useAddReviewMutation,
  useCreateProductMutation,
  useGetSellerProductsQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadProductImageMutation,
  useGetSellerOrdersQuery,
  useUpdateOrderStatusMutation,
  useGetSellerAnalyticsQuery,
  useGetDeliveryOrdersQuery,
  useUpdateDeliveryStatusMutation,
  useUpdateLocationMutation,
  useGetUsersQuery,
  useApproveSellerMutation,
  useApproveDeliveryBoyMutation,
  useGetAdminOrdersQuery,
  useAssignDeliveryBoyMutation,
  useUpdateAdminOrderStatusMutation,
  useGetAdminAnalyticsQuery,
  useGetProductsQuery,
  useSearchProductsQuery,
  useGetProductQuery,
  useCreatePaymentOrderMutation,
  useVerifyPaymentMutation,
  useMarkCODCollectedMutation,
} = api;