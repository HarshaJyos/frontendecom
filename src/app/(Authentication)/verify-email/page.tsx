// src/app/verify-email/page.tsx
'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  CircularProgress,
} from '@mui/material';
import { useVerifyEmailMutation } from '@/redux/api';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import PublicRoute from '@/components/PublicRoute';

export default function VerifyEmailPage() {
  const [code, setCode] = useState('');
  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  const getUserRole = () => {
    const stored = localStorage.getItem('userRole');
    if (!stored) return null;
    const { role, expiry } = JSON.parse(stored);
    if (Date.now() > expiry) {
      localStorage.removeItem('userRole');
      return null;
    }
    return role;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error('Invalid user ID');
      return;
    }
    try {
      await verifyEmail({ userId, otp: code }).unwrap();
      toast.success('Email verified successfully');
      const role = getUserRole();
      if (role === 'admin') {
        router.push(`/admin/activate?userId=${userId}`);
      } else {
        router.push('/login');
      }
    } catch (error) {
      toast.error('Invalid or expired code');
    }
  };

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
            Verify Email
          </Typography>
          <Typography sx={{ mb: 2, color: '#212121', textAlign: 'center' }}>
            Enter the verification code sent to your email
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              label="Verification Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              fullWidth
              required
              margin="normal"
              sx={{ '& .MuiInputLabel-root': { color: '#212121' } }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2, mb: 2, bgcolor: '#4CAF50', ':hover': { bgcolor: '#45a049' } }}
              disabled={isLoading || !userId}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Verify'}
            </Button>
            <Button
              onClick={() => router.push('/register')}
              fullWidth
              sx={{ color: '#4CAF50', textTransform: 'none' }}
            >
              Back to Register
            </Button>
          </Box>
        </Box>
      </Container>
    </PublicRoute>
  );
}