// src/providers/AuthProvider.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setUser, clearAuth, resetLoginSuccess } from '@/redux/features/authSlice';
import { useGetProfileQuery } from '@/redux/api';
import { AuthContext } from '@/context/AuthContext';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { loginSuccess } = useAppSelector((state) => state.auth);
  const { data, isLoading, isError, refetch } = useGetProfileQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [loading, setLoading] = useState(true);

  // Initialize auth state and handle profile fetch
  useEffect(() => {
    if (!isLoading) {
      if (data) {
        dispatch(setUser(data));
      } else if (isError) {
        dispatch(clearAuth());
      }
      setLoading(false);
    }
  }, [data, isLoading, isError, dispatch]);

  // Refetch profile on login success or localStorage trigger
  useEffect(() => {
    const loginTrigger = localStorage.getItem('loginSuccess');
    if (loginSuccess || loginTrigger) {
      refetch();
      dispatch(resetLoginSuccess());
      localStorage.removeItem('loginSuccess');
    }
  }, [loginSuccess, refetch, dispatch]);

  const checkAuth = () => {
    refetch();
  };

  const authContextValue = {
    isAuthenticated: !!data,
    user: data || null,
    loading,
    checkAuth,
  };

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
}

