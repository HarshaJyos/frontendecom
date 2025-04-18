// src/app/page.tsx (Updated to show loading state)
"use client";

import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
} from "@mui/material";
import { useAppSelector } from "@/redux/hooks";
import toast from "react-hot-toast";
import PublicRoute from "@/components/PublicRoute";
import HeroCarousel from "@/components/HeroCarousel";
import ProductCards from "@/components/ProductCards";
import { useRouter } from "next/navigation";
import { useGetProductsQuery } from "@/redux/api";
import { useEffect } from "react";

const carouselItems = [
  {
    id: 1,
    title: "Summer Collection 2025",
    description:
      "Discover our latest summer collection with styles for every occasion. Limited time offers available now.",
    imageUrl:
      "https://res.cloudinary.com/dt9diynji/image/upload/v1744879883/products/tstifaekzquy3uoz8joe.jpg", // Replace with your image paths
    ctaText: "Shop Now",
    ctaLink: "/collections/summer",
  },
  {
    id: 2,
    title: "Premium Accessories",
    description:
      "Complete your look with our handcrafted accessories. Free shipping on all orders over $50.",
    imageUrl:
      "https://res.cloudinary.com/dt9diynji/image/upload/v1744879883/products/tstifaekzquy3uoz8joe.jpg",
    ctaText: "Explore Collection",
    ctaLink: "/collections/accessories",
  },
  {
    id: 3,
    title: "New Arrivals",
    description:
      "Be the first to shop our newest styles. Fresh designs added weekly.",
    imageUrl:
      "https://res.cloudinary.com/dt9diynji/image/upload/v1744879883/products/tstifaekzquy3uoz8joe.jpg",
    ctaText: "View New Arrivals",
    ctaLink: "/collections/new",
  },
];

export default function HomePage() {
  const { isAuthenticated, loading, user } = useAppSelector(
    (state) => state.auth
  );
  const router = useRouter();
  const {
    data: products,
    isLoading,
    error,
  } = useGetProductsQuery({ limit: 4 });

  useEffect(() => {
    if (error) {
      toast.error("Failed to load products");
    }
  }, [error]);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  const handleClick = () => {
    toast.success("MUI, Redux Toolkit, and Toast are working!");
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PublicRoute>
      <HeroCarousel items={carouselItems} autoplaySpeed={6000} />
      <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center', fontFamily: 'Poppins, sans-serif' }}
      >
        Featured Products
      </Typography>
      {products && <ProductCards products={products} />}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="contained"
          onClick={() => router.push('/products')}
          sx={{
            bgcolor: '#4CAF50',
            ':hover': { bgcolor: '#45a049' },
            fontFamily: 'Poppins, sans-serif',
            textTransform: 'none',
          }}
        >
          View All
        </Button>
      </Box>
    </Container>
      <Container maxWidth="lg">
        <Box sx={{ my: 4, textAlign: "center" }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Next.js with MUI, Redux Toolkit, and Tailwind CSS
          </Typography>
          <Typography variant="h6" gutterBottom>
            {isAuthenticated ? `Welcome, ${user?.name}!` : "Please log in."}
          </Typography>
          <Button variant="contained" color="primary" onClick={handleClick}>
            Test Toast
          </Button>
        </Box>
      </Container>
    </PublicRoute>
  );
}
