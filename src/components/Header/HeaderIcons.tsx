//src/components/Header/HeaderIcons.tsx
'use client';

import { Box, IconButton, Menu, MenuItem, Typography, Badge } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useAppSelector } from '@/redux/hooks';
import { useLogoutMutation } from '@/redux/api';
import toast from 'react-hot-toast';
import { clearAuth } from '@/redux/features/authSlice';
import { useAppDispatch } from '@/redux/hooks';

export default function HeaderIcons() {
  const { isAuthenticated, user, loading, checkAuth } = useAuth();
  const router = useRouter();
  const [logout] = useLogoutMutation();
  const cartItems = useAppSelector((state) => state.user.profile?.cart?.length || 0);
  const wishlistItems = useAppSelector((state) => state.user.profile?.wishlist?.length || 0);
  const dispatch = useAppDispatch();
  
  // Local state to track authentication status
  const [localAuth, setLocalAuth] = useState(isAuthenticated);
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Update local auth state when context auth changes
  useEffect(() => {
    setLocalAuth(isAuthenticated);
  }, [isAuthenticated]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      // Close menu first
      handleMenuClose();
      
      // Update local state immediately to fix UI
      setLocalAuth(false);
      
      // Clear Redux state
      dispatch(clearAuth());
      
      // Call API endpoint
      await logout({}).unwrap();
      
      // Clean up localStorage
      localStorage.removeItem('userRole');
      localStorage.removeItem('loginSuccess');
      
      // Force a check of auth state
      checkAuth();
      
      toast.success('Logged out successfully');
      
      // Navigate to login page
      router.push('/login');
    } catch (error) {
      toast.error('Failed to logout');
      // If logout fails, refresh auth state
      checkAuth();
      setLocalAuth(isAuthenticated);
    }
  };

  if (loading) {
    return null; // Prevent rendering until auth state is resolved
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {localAuth && (
        <IconButton
          sx={{ display: { xs: 'none', md: 'flex' }, color: '#4CAF50' }}
          onClick={() => router.push('/location')}
        >
          <LocationOnIcon />
          <Typography sx={{ ml: 0.5, color: '#212121', fontSize: '0.9rem' }}>
            {user?.addresses?.[0]?.city || 'Set Location'}
          </Typography>
        </IconButton>
      )}
      <IconButton
        sx={{ color: '#4CAF50' }}
        onClick={() => router.push(localAuth ? '/wishlist' : '/login')}
      >
        <Badge badgeContent={wishlistItems} color="secondary">
          <FavoriteIcon />
        </Badge>
      </IconButton>
      <IconButton
        sx={{ color: '#4CAF50' }}
        onClick={() => router.push(localAuth ? '/cart' : '/login')}
      >
        <Badge badgeContent={cartItems} color="secondary">
          <ShoppingCartIcon />
        </Badge>
      </IconButton>
      <IconButton sx={{ color: '#4CAF50' }} onClick={handleMenuOpen}>
        <AccountCircleIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { mt: 1, backgroundColor: '#FFFFFF', color: '#212121' },
        }}
      >
        {localAuth ? [
          <MenuItem key="profile" onClick={() => { router.push('/profile'); handleMenuClose(); }}>
            Profile
          </MenuItem>,
          <MenuItem key="logout" onClick={handleLogout}>
            Logout
          </MenuItem>,
        ] : [
          <MenuItem key="login" onClick={() => { router.push('/login'); handleMenuClose(); }}>
            Login
          </MenuItem>,
        ]}
      </Menu>
    </Box>
  );
}