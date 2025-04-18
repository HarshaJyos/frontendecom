// src/app/admin/register/page.tsx
'use client';

import { useState } from 'react';
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
import { useRegisterMutation } from '@/redux/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import PublicRoute from '@/components/PublicRoute';

export default function AdminRegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [register, { isLoading }] = useRegisterMutation();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      const registerPayload = {
        name,
        email,
        password,
        role: 'admin',
      };
      const response = await register(registerPayload).unwrap();
      toast.success('Registered successfully! Please verify your email.');
      router.push(`/verify-email?userId=${response.userId}&role=admin`);
    } catch (error) {
        console.error('Registration error:', error);
      toast.error('Registration failed');
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
            Admin Register
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              margin="normal"
              sx={{ '& .MuiInputLabel-root': { color: '#212121' } }}
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
              margin="normal"
              sx={{ '& .MuiInputLabel-root': { color: '#212121' } }}
            />
            <TextField
              label="Password"
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
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Register Admin'}
            </Button>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                onClick={() => router.push('/login')}
                sx={{ color: '#4CAF50', textTransform: 'none' }}
              >
                Already have an account? Login
              </Button>
              <Button
                onClick={() => router.push('/register')}
                sx={{ color: '#4CAF50', textTransform: 'none' }}
              >
                Register as Buyer/Seller/Delivery
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </PublicRoute>
  );
}