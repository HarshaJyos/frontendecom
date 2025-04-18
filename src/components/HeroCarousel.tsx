// src/components/HeroCarousel.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography, useTheme, Container } from '@mui/material';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface CarouselItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
}

interface HeroCarouselProps {
  items: CarouselItem[];
  autoplaySpeed?: number;
}

const HeroCarousel = ({ items, autoplaySpeed = 5000 }: HeroCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const theme = useTheme();
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const handleMouseEnter = () => {
    setIsAutoplay(false);
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    setIsAutoplay(true);
  };

  // Set up autoplay
  useEffect(() => {
    if (isAutoplay) {
      autoplayRef.current = setInterval(() => {
        goToNext();
      }, autoplaySpeed);
    }

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [isAutoplay, autoplaySpeed]);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: { xs: '60vh', md: '80vh' },
        overflow: 'hidden',
        bgcolor: theme.palette.background.default,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Carousel Items */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transition: 'transform 0.5s ease-in-out',
        }}
      >
        {items.map((item, index) => (
          <Box
            key={item.id}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: index === currentIndex ? 1 : 0,
              transition: 'opacity 0.5s ease-in-out',
              zIndex: index === currentIndex ? 1 : 0,
            }}
          >
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
              }}
            >
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                priority={index === 0}
                style={{
                  objectFit: 'cover',
                }}
                sizes="100vw"
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5))',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Container maxWidth="lg">
                  <Box
                    sx={{
                      maxWidth: { xs: '100%', md: '60%' },
                      color: '#fff',
                      p: { xs: 2, md: 4 },
                    }}
                  >
                    <Typography
                      variant="h2"
                      component="h1"
                      sx={{
                        fontSize: { xs: '2rem', md: '3.5rem' },
                        fontWeight: 700,
                        mb: 2,
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: '1rem', md: '1.2rem' },
                        mb: 4,
                      }}
                    >
                      {item.description}
                    </Typography>
                    <Link href={item.ctaLink} passHref style={{ textDecoration: 'none' }}>
                      <Button
                        variant="contained"
                        size="large"
                        sx={{
                          bgcolor: theme.palette.primary.main,
                          color: '#fff',
                          px: 4,
                          py: 1.5,
                          fontSize: '1rem',
                          '&:hover': {
                            bgcolor: theme.palette.primary.dark,
                          },
                        }}
                        startIcon={<ShoppingBag size={20} />}
                      >
                        {item.ctaText}
                      </Button>
                    </Link>
                  </Box>
                </Container>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Navigation Buttons */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          px: { xs: 2, md: 4 },
          transform: 'translateY(-50%)',
          zIndex: 2,
        }}
      >
        <Button
          onClick={goToPrev}
          sx={{
            minWidth: { xs: '40px', md: '50px' },
            height: { xs: '40px', md: '50px' },
            bgcolor: 'rgba(255,255,255,0.3)',
            color: '#fff',
            borderRadius: '50%',
            '&:hover': {
              bgcolor: theme.palette.primary.main,
            },
          }}
        >
          <ChevronLeft />
        </Button>
        <Button
          onClick={goToNext}
          sx={{
            minWidth: { xs: '40px', md: '50px' },
            height: { xs: '40px', md: '50px' },
            bgcolor: 'rgba(255,255,255,0.3)',
            color: '#fff',
            borderRadius: '50%',
            '&:hover': {
              bgcolor: theme.palette.primary.main,
            },
          }}
        >
          <ChevronRight />
        </Button>
      </Box>

      {/* Indicators */}
      <Box
        sx={{
          position: 'absolute',
          bottom: { xs: 16, md: 32 },
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1,
          zIndex: 2,
        }}
      >
        {items.map((_, index) => (
          <Box
            key={`indicator-${index}`}
            onClick={() => goToSlide(index)}
            sx={{
              width: { xs: 8, md: 12 },
              height: { xs: 8, md: 12 },
              borderRadius: '50%',
              bgcolor: index === currentIndex ? theme.palette.primary.main : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: theme.palette.primary.light,
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default HeroCarousel;