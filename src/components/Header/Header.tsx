// src/components/Header.tsx
'use client';

import { AppBar, Toolbar, Box } from '@mui/material';
import Logo from './Logo';
import SearchBar from './SearchBar';
import HeaderIcons from './HeaderIcons';

export default function Header() {
  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: '#FFFFFF',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <Toolbar
        sx={{
          flexDirection: 'column',
          py: { xs: 1, md: 0 },
          minHeight: { xs: 'auto', md: 64 },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            mb: { xs: 1, md: 0 },
          }}
        >
          <Logo />
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              flexGrow: 1,
              justifyContent: 'center',
              mx: 2,
            }}
          >
            <SearchBar />
          </Box>
          <HeaderIcons />
        </Box>
        <Box
          sx={{
            display: { xs: 'block', md: 'none' },
            width: '100%',
          }}
        >
          <SearchBar />
        </Box>
      </Toolbar>
    </AppBar>
  );
}