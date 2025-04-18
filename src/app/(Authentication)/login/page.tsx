// src/app/login/page.tsx
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
import { useLoginMutation } from '@/redux/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import PublicRoute from '@/components/PublicRoute';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading }] = useLoginMutation();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password }).unwrap();
      toast.success('Logged in successfully');
      router.push('/');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Invalid email or password');
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
            Login
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
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
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2, mb: 2, bgcolor: '#4CAF50', ':hover': { bgcolor: '#45a049' } }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
            </Button>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                onClick={() => router.push('/forgot-password')}
                sx={{ color: '#4CAF50', textTransform: 'none' }}
              >
                Forgot Password?
              </Button>
              <Button
                onClick={() => router.push('/register')}
                sx={{ color: '#4CAF50', textTransform: 'none' }}
              >
                Register
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </PublicRoute>
  );
}