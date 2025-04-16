// src/app/unauthorized/page.tsx
'use client';

import { Typography, Container } from '@mui/material';

export default function UnauthorizedPage() {
  return (
    <Container>
      <Typography variant="h4">Unauthorized Access</Typography>
      <Typography>You do not have permission to view this page.</Typography>
    </Container>
  );
}