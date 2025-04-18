'use client';

import { useEffect } from 'react';
import { Container, Box, Typography, CircularProgress } from '@mui/material';
import toast from 'react-hot-toast';
import { useGetProductsQuery } from '@/redux/api';
import ProductCards from '@/components/ProductCards';

export default function ProductsPage() {
  const { data: products, isLoading, error } = useGetProductsQuery({});

  useEffect(() => {
    if (error) {
      toast.error('Failed to load products');
    }
  }, [error]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center', fontFamily: 'Poppins, sans-serif' }}
      >
        All Products
      </Typography>
      {products && <ProductCards products={products} />}
    </Container>
  );
}