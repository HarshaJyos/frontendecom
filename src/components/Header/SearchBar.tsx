// src/components/SearchBar.tsx
'use client';

import { Box, InputBase, IconButton } from '@mui/material';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSearch}
      sx={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: '4px',
        border: '1px solid #4CAF50',
        px: 1,
        width: { xs: '100%', md: '400px' },
      }}
    >
      <InputBase
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{ flex: 1, color: '#212121', fontFamily: 'Poppins, sans-serif' }}
      />
      <IconButton type="submit" sx={{ color: '#4CAF50' }}>
        <Search />
      </IconButton>
    </Box>
  );
}