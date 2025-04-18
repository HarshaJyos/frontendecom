'use client';

import { useEffect } from 'react';
import { Container, Box, Typography, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import toast from 'react-hot-toast';
import { useAppSelector } from '@/redux/hooks';
import { useGetBuyerOrdersQuery } from '@/redux/api';
import PrivateRoute from '@/components/PrivateRoute';
import { Order } from '@/types';

export default function OrdersPage() {
  const { orders } = useAppSelector((state) => state.buyer);
  const { isLoading, error } = useGetBuyerOrdersQuery(undefined);

  useEffect(() => {
    if (error) {
      toast.error('Failed to load orders');
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
    <PrivateRoute>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography
          variant="h4"
          sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center', fontFamily: 'Poppins, sans-serif' }}
        >
          Your Orders
        </Typography>
        <TableContainer component={Paper} sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2 }}>
          <Table sx={{ minWidth: 650 }} aria-label="orders table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>Order ID</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>Status</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>Total Amount</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>Payment Method</TableCell>
                <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>Created At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders?.map((order: Order) => (
                <TableRow key={order._id}>
                  <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>{order._id}</TableCell>
                  <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>{order.status}</TableCell>
                  <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>${order.totalAmount}</TableCell>
                  <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>{order.paymentMethod}</TableCell>
                  <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </PrivateRoute>
  );
}