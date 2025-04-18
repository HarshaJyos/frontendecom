//src/app/%28Authentication%29/verify-email/page.tsx
'use client';

import { useState, Suspense } from 'react';
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

// Create a separate component that uses useSearchParams
function VerifyEmailForm() {
  const [code, setCode] = useState('');
  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const role = searchParams.get('role');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error('Invalid user ID');
      return;
    }
    try {
      await verifyEmail({ userId, otp: code }).unwrap();
      toast.success('Email verified successfully');
      if (role === 'admin') {
        router.push(`/admin/activate?userId=${userId}`);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error(error);
      toast.error('Invalid or expired code');
    }
  };

  return (
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
  );
}

// Fallback component to show while suspended
function VerifyEmailFormFallback() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <CircularProgress />
    </Box>
  );
}

export default function VerifyEmailPage() {
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
          
          {/* Wrap the component that uses useSearchParams in Suspense */}
          <Suspense fallback={<VerifyEmailFormFallback />}>
            <VerifyEmailForm />
          </Suspense>
        </Box>
      </Container>
    </PublicRoute>
  );
}