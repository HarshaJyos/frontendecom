// src/providers/AuthProvider.tsx
'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/redux/hooks';

export default function AuthInitializer() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Trigger auth initialization on app load
    dispatch({ type: 'auth/INIT_AUTH' });
  }, [dispatch]);

  return null; // This component doesn't render anything
}