// src/app/reset-password/page.tsx
'use client';

import { useState, Suspense } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useResetPasswordMutation } from '@/redux/api';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import PublicRoute from '@/components/PublicRoute';

// Form component that uses useSearchParams
function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!token) {
      toast.error('Invalid or missing token');
      return;
    }
    try {
      await resetPassword({ token, newPassword: password }).unwrap();
      toast.success('Password reset successfully');
      router.push('/login');
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset password');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <TextField
        label="New Password"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        required
        margin="normal"
        sx={{ '& .MuiInputLabel-root': { color: '#212121' } }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
                sx={{ color: '#4CAF50' }}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <TextField
        label="Confirm Password"
        type={showConfirmPassword ? 'text' : 'password'}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        fullWidth
        required
        margin="normal"
        sx={{ '& .MuiInputLabel-root': { color: '#212121' } }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                edge="end"
                sx={{ color: '#4CAF50' }}
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 2, mb: 2, bgcolor: '#4CAF50', ':hover': { bgcolor: '#45a049' } }}
        disabled={isLoading || !token}
      >
        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
      </Button>
      <Button
        onClick={() => router.push('/login')}
        fullWidth
        sx={{ color: '#4CAF50', textTransform: 'none' }}
      >
        Back to Login
      </Button>
    </Box>
  );
}

// Fallback component to show while suspended
function ResetPasswordFormFallback() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <CircularProgress />
    </Box>
  );
}

export default function ResetPasswordPage() {
  
  return (
    <PublicRoute>
      <Container maxWidth="xs">
        <Box
          sx={{
            mt: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            bgcolor: '#FFFFFF',
            p: 3,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Typography variant="h5" sx={{ mb: 3, color: '#212121' }}>
            Reset Password
          </Typography>
          
          {/* Wrap the component that uses useSearchParams in Suspense */}
          <Suspense fallback={<ResetPasswordFormFallback />}>
            <ResetPasswordForm />
          </Suspense>
        </Box>
      </Container>
    </PublicRoute>
  );
}