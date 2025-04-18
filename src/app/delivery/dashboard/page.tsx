'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import dynamic from 'next/dynamic';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAppSelector } from '@/redux/hooks';
import {
  useGetDeliveryOrdersQuery,
  useUpdateDeliveryStatusMutation,
  useUpdateLocationMutation,
} from '@/redux/api';
import PrivateRoute from '@/components/PrivateRoute';
import { Order } from '@/types';

// Dynamically import the map component with SSR disabled
const MapWithNoSSR = dynamic(
  () => import('@/components/DeliveryMap'),
  { ssr: false }
);

export default function DeliveryDashboard() {
  const router = useRouter();
  const { isAuthenticated, user, loading: authLoading } = useAppSelector((state) => state.auth);
  const { orders } = useAppSelector((state) => state.order);
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.505, -0.09]); // Default: London
  const [isGeolocationSupported, setIsGeolocationSupported] = useState<boolean>(true);

  // API queries and mutations
  const { isLoading: ordersLoading, error: ordersError } = useGetDeliveryOrdersQuery({});
  const [updateDeliveryStatus, { isLoading: updateStatusLoading }] = useUpdateDeliveryStatusMutation();
  const [updateLocation, { isLoading: updateLocationLoading }] = useUpdateLocationMutation();

  // Check user authentication and role
  useEffect(() => {
    if (isAuthenticated && user?.role !== 'delivery') {
      router.push('/profile');
      toast.error('Access restricted to delivery personnel only');
    }
  }, [isAuthenticated, user, router]);

  // Set initial map center to delivery boy's location
  useEffect(() => {
    if (user?.deliveryDetails?.currentLocation) {
      const { latitude, longitude } = user.deliveryDetails.currentLocation;
      setMapCenter([latitude, longitude]);
    }
  }, [user]);

  // Check geolocation support - this runs only on the client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!navigator.geolocation) {
        setIsGeolocationSupported(false);
        toast.error('Geolocation is not supported by your browser');
      }
    }
  }, []);

  // Handle status update
  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await updateDeliveryStatus({ orderId, status }).unwrap();
      toast.success('Order status updated successfully');
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error('Failed to update order status');
    }
  };

  // Handle location update
  const handleUpdateLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      toast.error('Geolocation is not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          await updateLocation({ orderId: '', latitude, longitude }).unwrap(); // No orderId needed for delivery boy location
          setMapCenter([latitude, longitude]);
          toast.success('Location updated successfully');
        } catch (err) {
          console.error('Error updating location:', err);
          toast.error('Failed to update location');
        }
      },
      (err) => {
        toast.error(`Geolocation error: ${err.message}`);
      },
      { enableHighAccuracy: true }
    );
  };

  if (authLoading || ordersLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (ordersError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography color="error">Failed to load delivery orders</Typography>
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
          Delivery Dashboard
        </Typography>

        {/* Orders Table */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Poppins, sans-serif' }}>
            Assigned Orders
          </Typography>
          <TableContainer component={Paper} sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2 }}>
            <Table sx={{ minWidth: 650 }} aria-label="delivery orders table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>Order ID</TableCell>
                  <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>Buyer</TableCell>
                  <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>Status</TableCell>
                  <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>Total Amount</TableCell>
                  <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>Shipping Address</TableCell>
                  <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders?.map((order: Order) => (
                  <TableRow key={order._id}>
                    <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>{order._id}</TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>{order.buyer}</TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>{order.status}</TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>${order.totalAmount}</TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>
                      {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state},{' '}
                      {order.shippingAddress.country} {order.shippingAddress.zipCode}
                    </TableCell>
                    <TableCell>
                      <FormControl sx={{ minWidth: 120 }}>
                        <InputLabel sx={{ fontFamily: 'Poppins, sans-serif' }}>Status</InputLabel>
                        <Select
                          value=""
                          onChange={(e: SelectChangeEvent) => handleUpdateStatus(order._id, e.target.value)}
                          disabled={updateStatusLoading}
                          sx={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                          <MenuItem value="pending" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                            Pending
                          </MenuItem>
                          <MenuItem value="processing" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                            Processing
                          </MenuItem>
                          <MenuItem value="shipped" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                            Shipped
                          </MenuItem>
                          <MenuItem value="delivered" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                            Delivered
                          </MenuItem>
                          <MenuItem value="cancelled" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                            Cancelled
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Map and Location Update */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif' }}>
            Delivery Map
          </Typography>
          <Box sx={{ width: '100%', height: 400, borderRadius: 2, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            {/* Dynamically loaded map component */}
            <MapWithNoSSR mapCenter={mapCenter} user={user} orders={orders || []} />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              startIcon={<LocationOnIcon />}
              onClick={handleUpdateLocation}
              disabled={updateLocationLoading || !isGeolocationSupported}
              sx={{
                bgcolor: '#4CAF50',
                ':hover': { bgcolor: '#45a049' },
                fontFamily: 'Poppins, sans-serif',
                textTransform: 'none',
              }}
            >
              {updateLocationLoading ? <CircularProgress size={24} color="inherit" /> : 'Update My Location'}
            </Button>
          </Box>
        </Box>
      </Container>
    </PrivateRoute>
  );
}