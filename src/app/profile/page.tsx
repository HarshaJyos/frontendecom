// src/app/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Tabs,
  Tab,
  Typography,
  TextField,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControlLabel,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import StarIcon from '@mui/icons-material/Star';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAppSelector } from '@/redux/hooks';
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
  useGetDefaultAddressQuery,
  useGetCartQuery,
  useGetBuyerOrdersQuery,
} from '@/redux/api';
import PrivateRoute from '@/components/PrivateRoute';
import { Address, Order } from '@/types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const {  user, loading: authLoading } = useAppSelector((state) => state.auth);
  const [tabValue, setTabValue] = useState(0);

  // Profile state
  const { data: profile, isLoading: profileLoading, error: profileError } = useGetProfileQuery(undefined);
  const [updateProfile, { isLoading: updateProfileLoading }] = useUpdateProfileMutation();
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [availability, setAvailability] = useState(false);

  // Address state
  const { data: addresses, isLoading: addressesLoading, error: addressesError } = useGetAddressesQuery(undefined);
  const { data: defaultAddress, isLoading: defaultAddressLoading } = useGetDefaultAddressQuery(undefined);
  const [addAddress, { isLoading: addAddressLoading }] = useAddAddressMutation();
  const [updateAddress, { isLoading: updateAddressLoading }] = useUpdateAddressMutation();
  const [deleteAddress, { isLoading: deleteAddressLoading }] = useDeleteAddressMutation();
  const [setDefaultAddress, { isLoading: setDefaultAddressLoading }] = useSetDefaultAddressMutation();
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
  });
  const [editAddress, setEditAddress] = useState<Address | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  // Cart state (buyer only)
  const { data: cart, isLoading: cartLoading, error: cartError } = useGetCartQuery(undefined, {
    skip: user?.role !== 'buyer',
  });

  // Orders state (buyer only)
  const { data: orders, isLoading: ordersLoading, error: ordersError } = useGetBuyerOrdersQuery(undefined, {
    skip: user?.role !== 'buyer',
  });

  // Initialize profile form with user data
  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setBusinessName(profile.sellerDetails?.businessName || '');
      setBusinessAddress(profile.sellerDetails?.businessAddress || '');
      setAvailability(profile.deliveryDetails?.availability || false);
    }
  }, [profile]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = { name };
      if (user?.role === 'seller') {
        payload.sellerDetails = { businessName, businessAddress };
      }
      if (user?.role === 'delivery') {
        payload.deliveryDetails = { availability };
      }
      await updateProfile(payload).unwrap();
      toast.success('Profile updated successfully');
    } catch (error) {
        console.error(error);
      toast.error('Failed to update profile');
    }
  };

  // Handle address addition
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addAddress(newAddress).unwrap();
      toast.success('Address added successfully');
      setNewAddress({ street: '', city: '', state: '', country: '', zipCode: '' });
    } catch (error) {
        console.error(error);
      toast.error('Failed to add address');
    }
  };

  // Handle address update
  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAddress?._id) return;
    try {
      await updateAddress({ addressId: editAddress._id, data: editAddress }).unwrap();
      toast.success('Address updated successfully');
      setOpenEditDialog(false);
      setEditAddress(null);
    } catch (error) {
        console.error(error);
      toast.error('Failed to update address');
    }
  };

  // Handle address deletion
  const handleDeleteAddress = async (addressId: string) => {
    try {
      await deleteAddress(addressId).unwrap();
      toast.success('Address deleted successfully');
    } catch (error) {
        console.error(error);
      toast.error('Failed to delete address');
    }
  };

  // Handle set default address
  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      await setDefaultAddress(addressId).unwrap();
      toast.success('Default address set successfully');
    } catch (error) {
        console.error(error);
      toast.error('Failed to set default address');
    }
  };

  // Open edit address dialog
  const handleOpenEditDialog = (address: Address) => {
    setEditAddress(address);
    setOpenEditDialog(true);
  };

  // Close edit address dialog
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditAddress(null);
  };

  // Handle navigation to role-specific dashboards
  const handleNavigateDashboard = () => {
    if (user?.role === 'seller') {
      router.push('/seller/dashboard');
    } else if (user?.role === 'delivery') {
      router.push('/delivery/dashboard');
    } else if (user?.role === 'admin') {
      router.push('/admin/dashboard');
    }
  };

  // Handle navigation to cart or order details (buyer only)
  const handleViewCart = () => {
    router.push('/cart');
  };

  const handleViewOrder = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  if (
    authLoading ||
    profileLoading ||
    addressesLoading ||
    defaultAddressLoading ||
    (user?.role === 'buyer' && (cartLoading || ordersLoading))
  ) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (profileError || addressesError || (user?.role === 'buyer' && (cartError || ordersError))) {
    toast.error('Failed to load profile data');
    return null;
  }

  // Determine tabs based on role
  const tabs = ['Profile', 'Addresses'];
  if (user?.role === 'buyer') {
    tabs.push('Cart', 'Orders');
  }

  return (
    <PrivateRoute>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}>
          My Profile
        </Typography>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered sx={{ mb: 2 }}>
            {tabs.map((tab) => (
              <Tab key={tab} label={tab} />
            ))}
          </Tabs>
        </Box>

        {/* Profile Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box
            component="form"
            onSubmit={handleUpdateProfile}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              maxWidth: 400,
              mx: 'auto',
              p: 2,
              bgcolor: '#FFFFFF',
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <Typography variant="h6">Update Profile</Typography>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              variant="outlined"
              sx={{ '& .MuiInputLabel-root': { color: '#212121' } }}
            />
            <TextField
              label="Email"
              type="email"
              value={profile?.email || ''}
              disabled
              fullWidth
              variant="outlined"
              sx={{ '& .MuiInputLabel-root': { color: '#212121' } }}
            />
            {user?.role === 'seller' && (
              <>
                <TextField
                  label="Business Name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  fullWidth
                  variant="outlined"
                  sx={{ '& .MuiInputLabel-root': { color: '#212121' } }}
                />
                <TextField
                  label="Business Address"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  fullWidth
                  variant="outlined"
                  sx={{ '& .MuiInputLabel-root': { color: '#212121' } }}
                />
                <Typography variant="body2" sx={{ color: '#212121' }}>
                  Verification Status: {profile?.sellerDetails?.verificationStatus}
                </Typography>
              </>
            )}
            {user?.role === 'delivery' && (
              <FormControlLabel
                control={
                  <Switch
                    checked={availability}
                    onChange={(e) => setAvailability(e.target.checked)}
                    color="primary"
                  />
                }
                label="Available for Delivery"
                sx={{ color: '#212121' }}
              />
            )}
            {user?.role === 'admin' && (
              <Typography variant="body2" sx={{ color: '#212121' }}>
                Admin Account Activated: {profile?.adminDetails?.isActivated ? 'Yes' : 'No'}
              </Typography>
            )}
            <Button
              type="submit"
              variant="contained"
              disabled={updateProfileLoading}
              sx={{ bgcolor: '#4CAF50', ':hover': { bgcolor: '#45a049' } }}
            >
              {updateProfileLoading ? <CircularProgress size={24} color="inherit" /> : 'Update Profile'}
            </Button>
            {(user?.role === 'seller' || user?.role === 'delivery' || user?.role === 'admin') && (
              <Button
                variant="outlined"
                onClick={handleNavigateDashboard}
                sx={{ mt: 2, color: '#4CAF50', borderColor: '#4CAF50' }}
              >
                Go to {user?.role === 'seller' ? 'Seller' : user?.role === 'delivery' ? 'Delivery' : 'Admin'} Dashboard
              </Button>
            )}
          </Box>
        </TabPanel>

        {/* Addresses Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Your Addresses
            </Typography>
            {defaultAddress && (
              <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Default Address <StarIcon sx={{ color: '#FFD700' }} />
                </Typography>
                <Typography>
                  {defaultAddress.street}, {defaultAddress.city}, {defaultAddress.state}, {defaultAddress.country},{' '}
                  {defaultAddress.zipCode}
                </Typography>
              </Box>
            )}
            <List>
              {addresses?.map((address: Address) => (
                <Box key={address._id}>
                  <ListItem>
                    <ListItemText
                      primary={`${address.street}, ${address.city}, ${address.state}`}
                      secondary={`${address.country}, ${address.zipCode}`}
                    />
                    <Box>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => handleOpenEditDialog(address)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDeleteAddress(address._id!)}
                        disabled={deleteAddressLoading}
                      >
                        <DeleteIcon />
                      </IconButton>
                      {defaultAddress?._id !== address._id && (
                        <IconButton
                          edge="end"
                          aria-label="set default"
                          onClick={() => handleSetDefaultAddress(address._id!)}
                          disabled={setDefaultAddressLoading}
                          sx={{ ml: 1 }}
                        >
                          <StarIcon />
                        </IconButton>
                      )}
                    </Box>
                  </ListItem>
                  <Divider />
                </Box>
              ))}
            </List>
            <Box
              component="form"
              onSubmit={handleAddAddress}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                mt: 3,
                p: 2,
                bgcolor: '#FFFFFF',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <Typography variant="h6">Add New Address</Typography>
              <TextField
                label="Dr.No, Street"
                value={newAddress.street}
                onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                fullWidth
                required
                variant="outlined"
                sx={{ '& .MuiInputLabel-root': { color: '#212121' } }}
              />
              <TextField
                label="City"
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                fullWidth
                required
                variant="outlined"
                sx={{ '& .MuiInputLabel-root': { color: '#212121' } }}
              />
              <TextField
                label="State"
                value={newAddress.state}
                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                fullWidth
                required
                variant="outlined"
                sx={{ '& .MuiInputLabel-root': { color: '#212121' } }}
              />
              <TextField
                label="Country"
                value={newAddress.country}
                onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                fullWidth
                required
                variant="outlined"
                sx={{ '& .MuiInputLabel-root': { color: '#212121' } }}
              />
              <TextField
                label="Zip Code"
                value={newAddress.zipCode}
                onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                fullWidth
                required
                variant="outlined"
                sx={{ '& .MuiInputLabel-root': { color: '#212121' } }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={addAddressLoading}
                sx={{ bgcolor: '#4CAF50', ':hover': { bgcolor: '#45a049' } }}
              >
                {addAddressLoading ? <CircularProgress size={24} color="inherit" /> : 'Add Address'}
              </Button>
            </Box>
          </Box>

          {/* Edit Address Dialog */}
          <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
            <DialogTitle>Edit Address</DialogTitle>
            <DialogContent>
              <Box
                component="form"
                onSubmit={handleUpdateAddress}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}
              >
                <TextField
                  label="Street"
                  value={editAddress?.street || ''}
                  onChange={(e) => setEditAddress({ ...editAddress!, street: e.target.value })}
                  fullWidth
                  required
                  variant="outlined"
                  sx={{ '& .MuiInputLabel-root': { color: '#212121' } }}
                />
                <TextField
                  label="City"
                  value={editAddress?.city || ''}
                  onChange={(e) => setEditAddress({ ...editAddress!, city: e.target.value })}
                  fullWidth
                  required
                  variant="outlined"
                  sx={{ '& .MuiInputLabel-root': { color: '#212121' } }}
                />
                <TextField
                  label="State"
                  value={editAddress?.state || ''}
                  onChange={(e) => setEditAddress({ ...editAddress!, state: e.target.value })}
                  fullWidth
                  required
                  variant="outlined"
                  sx={{ '& .MuiInputLabel-root': { color: '#212121' } }}
                />
                <TextField
                  label="Country"
                  value={editAddress?.country || ''}
                  onChange={(e) => setEditAddress({ ...editAddress!, country: e.target.value })}
                  fullWidth
                  required
                  variant="outlined"
                  sx={{ '& .MuiInputLabel-root': { color: '#212121' } }}
                />
                <TextField
                  label="Zip Code"
                  value={editAddress?.zipCode || ''}
                  onChange={(e) => setEditAddress({ ...editAddress!, zipCode: e.target.value })}
                  fullWidth
                  required
                  variant="outlined"
                  sx={{ '& .MuiInputLabel-root': { color: '#212121' } }}
                />
                <DialogActions>
                  <Button onClick={handleCloseEditDialog} sx={{ color: '#4CAF50' }}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={updateAddressLoading}
                    sx={{ bgcolor: '#4CAF50', ':hover': { bgcolor: '#45a049' } }}
                  >
                    {updateAddressLoading ? <CircularProgress size={24} color="inherit" /> : 'Update Address'}
                  </Button>
                </DialogActions>
              </Box>
            </DialogContent>
          </Dialog>
        </TabPanel>

        {/* Cart Tab (Buyer Only) */}
        {user?.role === 'buyer' && (
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Your Cart
              </Typography>
              {cart && cart.length > 0 ? (
                <List>
                  {cart.map((item: { product: string; quantity: number | null; variant: { color: string; size: string; price: number; stock: number }; }) => (
                    <ListItem key={item.product}>
                      <ListItemText
                        primary={`Product ID: ${item.product}`}
                        secondary={`Quantity: ${item.quantity}, Variant: ${item.variant}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography>No items in cart</Typography>
              )}
              <Button
                variant="contained"
                onClick={handleViewCart}
                sx={{ mt: 2, bgcolor: '#4CAF50', ':hover': { bgcolor: '#45a049' } }}
              >
                View Full Cart
              </Button>
            </Box>
          </TabPanel>
        )}

        {/* Orders Tab (Buyer Only) */}
        {user?.role === 'buyer' && (
          <TabPanel value={tabValue} index={3}>
            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Your Orders
              </Typography>
              {orders && orders.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 650 }} aria-label="orders table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Order ID</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Total Amount</TableCell>
                        <TableCell>Created At</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orders.map((order: Order) => (
                        <TableRow key={order._id}>
                          <TableCell>{order._id}</TableCell>
                          <TableCell>{order.status}</TableCell>
                          <TableCell>${order.totalAmount}</TableCell>
                          <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              onClick={() => handleViewOrder(order._id)}
                              sx={{ color: '#4CAF50', borderColor: '#4CAF50' }}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography>No orders found</Typography>
              )}
            </Box>
          </TabPanel>
        )}
      </Container>
    </PrivateRoute>
  );
}