export type Role = "buyer" | "seller" | "delivery" | "admin";

export interface Address {
  _id?: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  geoLocation?: { latitude: number; longitude: number };
}

export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  status: "pending" | "active" | "rejected";
  emailVerified: boolean;
  otp?: { code: string; expiresAt: string };
  refreshTokens: { token: string; expiresAt: string }[];
  cart: { product: string; variant: number; quantity: number }[];
  wishlist: string[];
  addresses: Address[];
  isActive: boolean;
  sellerDetails?: { verificationStatus: "pending" | "approved" | "rejected"; businessName?: string; businessAddress?: string };
  deliveryDetails?: { currentLocation?: { latitude: number; longitude: number }; availability: boolean };
  adminDetails?: { isActivated: boolean };
  resetPasswordToken?: string;
  resetPasswordExpires?: string;
}

export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  categories: string[];
  tags: string[];
  seller: string;
  ratings: number;
  reviews: string[];
  variants: { color: string; size: string; price: number; stock: number }[];
  isActive: boolean;
}

export interface Order {
  _id: string;
  buyer: string;
  products: { product: string; variant: number; quantity: number }[];
  shippingAddress: Address;
  paymentMethod: "razorpay" | "cod";
  paymentStatus: "pending" | "completed" | "failed";
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  totalAmount: number;
  geoLocation?: { latitude: number; longitude: number };
  deliveryBoy?: string;
  createdAt: string;
}

export interface Review {
  _id: string;
  user: string;
  product: string;
  order: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface SellerAnalytics {
    totalIncome: number;
    productCount: number;
    orderCount: number;
    topProducts: Array<{
      _id: string;
      title: string;
      description: string;
      price: number;
      stock: number;
      images: string[];
      categories: string[];
      tags: string[];
      seller: string;
      ratings: number;
      reviews: string[];
      variants: Array<{
        color: string;
        size: string;
        price: number;
        stock: number;
      }>;
      isActive: boolean;
    }>;
  }
  
  export interface AdminAnalytics {
    totalUsers: number;
    usersByRole: Array<{
      _id: "buyer" | "seller" | "delivery" | "admin";
      count: number;
    }>;
    totalRevenue: number;
    ordersByStatus: Array<{
      _id: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
      count: number;
    }>;
    topProducts: Array<{
      _id: string;
      title: string;
      description: string;
      price: number;
      stock: number;
      images: string[];
      categories: string[];
      tags: string[];
      seller: {
        _id: string;
        name: string;
      };
      ratings: number;
      reviews: string[];
      variants: Array<{
        color: string;
        size: string;
        price: number;
        stock: number;
      }>;
      isActive: boolean;
    }>;
  }