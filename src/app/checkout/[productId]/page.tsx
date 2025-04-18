'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import toast from 'react-hot-toast';
import { useAppSelector } from '@/redux/hooks';
import {
  useGetProductQuery,
  useGetDefaultAddressQuery,
  useCreateSingleProductOrderMutation,
  useCreatePaymentOrderMutation,
  useVerifyPaymentMutation,
} from '@/redux/api';
import {  Order } from '@/types';

declare global {
    interface Window {
      Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
    }
  }
  
  interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler?: (response: PaymentResponse) => void;
    prefill: {
        name: string;
        email: string;
      }
    theme?: { color: string };
  }
  interface PaymentFailureResponse {
    error: {
      description: string;
      [key: string]: unknown;
    };
  }
  
  interface RazorpayInstance {
    on(event: "payment.failed", callback: (response: PaymentFailureResponse) => void): void;
    open(): void;
  }
  interface PaymentResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }
  

export default function CheckoutPage() {
  const router = useRouter();
  const { productId } = useParams();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { data: product, isLoading: productLoading, error: productError } = useGetProductQuery(productId as string);
  const { data: address, isLoading: addressLoading, error: addressError } = useGetDefaultAddressQuery(undefined);
  const [createSingleProductOrder, { isLoading: orderLoading }] = useCreateSingleProductOrderMutation();
  const [createPaymentOrder, { isLoading: paymentOrderLoading }] = useCreatePaymentOrderMutation();
  const [verifyPayment, { isLoading: verifyLoading }] = useVerifyPaymentMutation();
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState({ color: '', size: '' });
  const [variantIndex, setVariantIndex] = useState(0);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => toast.error('Failed to load Razorpay SDK');
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (productError || addressError) {
      toast.error('Failed to load checkout data');
    }
    if (!isAuthenticated) {
      toast.error('Please log in to proceed');
      router.push('/login');
    }
    if (product && product.variants.length > 0) {
      const variantIndexParam = searchParams.get('variantIndex');
      const index = variantIndexParam ? parseInt(variantIndexParam, 10) : 0;
      setVariantIndex(index >= 0 && index < product.variants.length ? index : 0);
      setSelectedVariant({
        color: product.variants[index]?.color || product.variants[0].color,
        size: product.variants[index]?.size || product.variants[0].size,
      });
    }
  }, [productError, addressError, isAuthenticated, router, product, searchParams]);

  const handleVariantChange = (color: string, size: string) => {
    if (!product) return;
    setSelectedVariant({ color, size });
    const index = product.variants.findIndex((v:{ color: string; size: string; price: number; stock: number }) => v.color === color && v.size === size);
    setVariantIndex(index !== -1 ? index : 0);
  };

  const createOrder = async (paymentMethod: 'cod' | 'razorpay') => {
    if (!product || !address) {
      toast.error('Product or address not found');
      return null;
    }
    try {
      const order = await createSingleProductOrder({
        productId: product._id,
        variantIndex,
        quantity: 1,
        addressId: address._id,
        paymentMethod,
      }).unwrap();
      setOrder(order);
      return order;
    } catch (error) {
        console.error('Error creating order:', error);
      toast.error('Failed to create order');
      return null;
    }
  };

  const handleCODCheckout = async () => {
    const order = await createOrder('cod');
    if (!order) return;
    toast.success('Order placed successfully with COD');
    router.push('/orders');
  };

  const handleRazorpayCheckout = async () => {
    if (!razorpayLoaded) {
      toast.error('Razorpay SDK not loaded');
      return;
    }
    if (!product || !address) return;
    let currentOrder = order;
    if (!currentOrder) {
      currentOrder = await createOrder('razorpay');
      if (!currentOrder) return;
    }
    const variantPrice = product.variants[variantIndex].price;

    try {
      const paymentOrder = await createPaymentOrder({
        orderId: currentOrder._id,
        amount: variantPrice * 100, // Razorpay expects amount in paise
        currency: 'INR',
      }).unwrap();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'YOUR_RAZORPAY_KEY',
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        order_id: paymentOrder.id,
        name: 'E-Commerce',
        description: `Purchase of ${product.title}`,
        handler: (response:PaymentResponse) => {
          verifyPayment({
              orderId: currentOrder!._id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
            })
            .unwrap()
            .then(() => {
              toast.success('Order placed successfully');
              setOrder(null);
              router.push('/orders');
            })
            .catch((error) => {
              console.error('Error verifying payment:', error);
              toast.error('Payment verification failed');
              setOrder({ ...currentOrder!, paymentStatus: 'failed' });
            });
        },
        prefill: {
          name: user?.name ?? '',
          email: user?.email ?? '',
        },
        theme: { color: '#4CAF50' },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
        console.error('Error creating payment order:', error);
      toast.error('Failed to initiate payment');
      setOrder({ ...currentOrder!, paymentStatus: 'failed' });
    }
  };

  const isRetryAllowed = () => {
    if (!order || order.paymentMethod !== 'razorpay' || order.paymentStatus !== 'pending') return false;
    const createdAt = new Date(order.createdAt);
    const now = new Date();
    const diffInMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
    return diffInMinutes <= 30;
  };

  if (productLoading || addressLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!product || !address) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography sx={{ fontFamily: 'Poppins, sans-serif', textAlign: 'center' }}>
          Product or address not found
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center', fontFamily: 'Poppins, sans-serif' }}
      >
        Checkout
      </Typography>
      {order && order.paymentStatus === 'failed' && (
        <Box sx={{ mb: 2, p: 2, bgcolor: '#ffebee', borderRadius: 2 }}>
          <Typography sx={{ fontFamily: 'Poppins, sans-serif', color: '#d32f2f' }}>
            Payment failed. {isRetryAllowed() ? 'Please retry within 30 minutes.' : 'Retry period expired.'}
          </Typography>
        </Box>
      )}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', mb: 2 }}>
                Order Summary
              </Typography>
              <Typography sx={{ fontFamily: 'Poppins, sans-serif' }}>
                Product: {product.title}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <FormControl size="small" sx={{ flex: 1 }}>
                  <InputLabel sx={{ fontFamily: 'Poppins, sans-serif' }}>Color</InputLabel>
                  <Select
                    value={selectedVariant.color}
                    label="Color"
                    onChange={(e) => handleVariantChange(e.target.value as string, selectedVariant.size)}
                    sx={{ fontFamily: 'Poppins, sans-serif' }}
                    disabled={!!order}
                  >
                    {[...new Set(product.variants.map((v: { color: string; size: string; price: number; stock: number }) => v.color))].map((color) => (
                      <MenuItem key={color as string} value={color as string} sx={{ fontFamily: 'Poppins, sans-serif' }}>
                        {color as string}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ flex: 1 }}>
                  <InputLabel sx={{ fontFamily: 'Poppins, sans-serif' }}>Size</InputLabel>
                  <Select
                    value={selectedVariant.size}
                    label="Size"
                    onChange={(e) => handleVariantChange(selectedVariant.color, e.target.value as string)}
                    sx={{ fontFamily: 'Poppins, sans-serif' }}
                    disabled={!!order}
                  >
                    {[...new Set(product.variants.map((v: { color: string; size: string; price: number; stock: number }) => v.size))].map((size) => (
                      <MenuItem key={String(size)} value={String(size)} sx={{ fontFamily: 'Poppins, sans-serif' }}>
                        {String(size)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Typography sx={{ fontFamily: 'Poppins, sans-serif', mt: 1 }}>
                Price: ${product.variants[variantIndex].price.toFixed(2)}
              </Typography>
              <Typography sx={{ fontFamily: 'Poppins, sans-serif' }}>
                Quantity: 1
              </Typography>
              <Typography sx={{ fontFamily: 'Poppins, sans-serif', mt: 1, fontWeight: 'bold' }}>
                Total: ${product.variants[variantIndex].price.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', mb: 2 }}>
                Shipping Address
              </Typography>
              <Typography sx={{ fontFamily: 'Poppins, sans-serif' }}>
                {address.street}, {address.city}, {address.state}, {address.country} {address.zipCode}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', mb: 2 }}>
                Payment Options
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleCODCheckout}
                  disabled={orderLoading || !!order}
                  sx={{
                    bgcolor: '#4CAF50',
                    ':hover': { bgcolor: '#45a049' },
                    fontFamily: 'Poppins, sans-serif',
                    textTransform: 'none',
                  }}
                >
                  {orderLoading ? <CircularProgress size={24} color="inherit" /> : 'Cash on Delivery'}
                </Button>
                <Button
                  variant="contained"
                  onClick={handleRazorpayCheckout}
                  disabled={(orderLoading || paymentOrderLoading || verifyLoading || !razorpayLoaded) && (!order || !isRetryAllowed())}
                  sx={{
                    bgcolor: '#4CAF50',
                    ':hover': { bgcolor: '#45a049' },
                    fontFamily: 'Poppins, sans-serif',
                    textTransform: 'none',
                  }}
                >
                  {(orderLoading || paymentOrderLoading || verifyLoading) ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : order && isRetryAllowed() ? (
                    'Retry Payment'
                  ) : (
                    'Pay with Razorpay'
                  )}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
}