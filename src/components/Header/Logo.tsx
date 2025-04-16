// src/components/Header/Logo.tsx
'use client';

import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" style={{ textDecoration: 'none' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Image src="/logo.svg" alt="YKART Logo" width={40} height={40} priority />
        <Typography
          variant="h6"
          sx={{ color: '#212121', fontWeight: 600 }}
        >
          YKART
        </Typography>
      </Box>
    </Link>
  );
}