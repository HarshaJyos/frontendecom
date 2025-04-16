'use client';

import { Container, Typography, Box, Button } from '@mui/material';
import toast from 'react-hot-toast';

export default function HomePage() {
  const handleClick = () => {
    toast.success('MUI, Redux Toolkit, and Toast are working!');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Next.js with MUI, Redux Toolkit, and Tailwind CSS
        </Typography>
        <Button variant="contained" color="primary" onClick={handleClick}>
          Test Toast
        </Button>
      </Box>
    </Container>
  );
}