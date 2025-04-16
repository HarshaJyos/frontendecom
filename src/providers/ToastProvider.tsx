// src/providers/ToastProvider.tsx
'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontFamily: 'Poppins, sans-serif', background: '#FFFFFF', color: '#212121' },
          success: { style: { border: '2px solid #4CAF50' } },
          error: { style: { border: '2px solid #F44336' } },
        }}
      />
    </>
  );
}