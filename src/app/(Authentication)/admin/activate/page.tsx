// src/app/admin/activate/page.tsx
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
import { useActivateAdminMutation } from '@/redux/api';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import PublicRoute from '@/components/PublicRoute';

// Create a separate component that uses useSearchParams
function AdminActivateForm() {
  const [secret, setSecret] = useState('');
  const [activateAdmin, { isLoading }] = useActivateAdminMutation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error('Invalid user ID');
      return;
    }
    try {
      await activateAdmin({ userId, secret }).unwrap();
      toast.success('Admin account activated successfully');
      router.push('/login');
    } catch (error) {
      console.error(error);
      toast.error('Invalid secret key');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <TextField
        label="Secret Key"
        value={secret}
        onChange={(e) => setSecret(e.target.value)}
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
        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Activate'}
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
function AdminActivateFormFallback() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <CircularProgress />
    </Box>
  );
}

export default function AdminActivatePage() {
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
            Activate Admin Account
          </Typography>
          <Typography sx={{ mb: 2, color: '#212121', textAlign: 'center' }}>
            Enter the admin secret key to activate your account
          </Typography>
          
          {/* Wrap the component that uses useSearchParams in Suspense */}
          <Suspense fallback={<AdminActivateFormFallback />}>
            <AdminActivateForm />
          </Suspense>
        </Box>
      </Container>
    </PublicRoute>
  );
}