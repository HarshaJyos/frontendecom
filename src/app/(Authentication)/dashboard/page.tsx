// Example usage: src/app/dashboard/page.tsx
'use client';

import PrivateRoute from '@/components/PrivateRoute';
import { Typography, Container } from '@mui/material';

export default function DashboardPage() {
  return (
    <PrivateRoute allowedRoles={['admin', 'seller']}>
      <Container>
        <Typography variant="h4">Dashboard</Typography>
        {/* Add your dashboard content here */}
      </Container>
    </PrivateRoute>
  );
}