'use client';

import { useRouter } from 'next/navigation';
import { Box, Card, CardContent, CardMedia, Typography, Button, Rating, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { ShoppingCart, Heart, HeartOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useAddToCartMutation, useAddToWishlistMutation, useRemoveFromWishlistMutation } from '@/redux/api';
import { Product } from '@/types';
import Image from 'next/image';

interface ProductCardsProps {
  products: Product[];
}

export default function ProductCards({ products }: ProductCardsProps) {
  const router = useRouter();
  const {  isAuthenticated } = useAppSelector((state) => state.auth);
  const { wishlist } = useAppSelector((state) => state.buyer);
  const [addToCart, { isLoading: cartLoading }] = useAddToCartMutation();
  const [addToWishlist, { isLoading: addWishlistLoading }] = useAddToWishlistMutation();
  const [removeFromWishlist, { isLoading: removeWishlistLoading }] = useRemoveFromWishlistMutation();
  const [variantSelections, setVariantSelections] = useState<{ [key: string]: { color: string; size: string } }>({});

  const handleVariantChange = (productId: string, color: string, size: string) => {
    setVariantSelections((prev) => ({
      ...prev,
      [productId]: { color, size },
    }));
  };

  const handleAddToCart = async (productId: string, variants: Product['variants']) => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to cart');
      router.push('/login');
      return;
    }
    const selection = variantSelections[productId] || { color: variants[0].color, size: variants[0].size };
    const variantIndex = variants.findIndex(
      (v) => v.color === selection.color && v.size === selection.size
    );
    if (variantIndex === -1) {
      toast.error('Invalid variant selected');
      return;
    }
    try {
      await addToCart({ productId: productId, variant: variantIndex, quantity: 1 }).unwrap();
      toast.success('Added to cart');
    } catch (error) {
        console.error(error);
      toast.error('Failed to add to cart');
    }
  };

  const handleWishlistToggle = async (productId: string, isInWishlist: boolean) => {
    if (!isAuthenticated) {
      toast.error('Please log in to manage wishlist');
      router.push('/login');
      return;
    }
    try {
      if (isInWishlist) {
        await removeFromWishlist(productId).unwrap();
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist({ productId }).unwrap();
        toast.success('Added to wishlist');
      }
    } catch (error) {
        console.error(error);
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        justifyContent: 'center',
      }}
    >
      {products.map((product) => {
        const isInWishlist = wishlist.includes(product._id);
        const selectedVariant = variantSelections[product._id] || {
          color: product.variants[0]?.color || '',
          size: product.variants[0]?.size || '',
        };
        return (
          <Card
            key={product._id}
            sx={{
              width: { xs: 'calc(50% - 8px)', sm: 'calc(33.33% - 16px)', md: 'calc(25% - 16px)' },
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.02)' },
              maxHeight: 350,
            }}
            onClick={() => router.push(`/products/${product._id}`)}
          >
            <CardMedia sx={{ position: 'relative', height: 150 }}>
              <Image
                src={product.images[0] || '/images/placeholder.png'}
                alt={product.title}
                fill
                style={{ objectFit: 'cover', borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
                sizes="(max-width: 600px) 50vw, (max-width: 960px) 33vw, 25vw"
              />
            </CardMedia>
            <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography
                variant="body1"
                sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 'bold', mb: 0.5 }}
                noWrap
              >
                {product.title}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif', color: '#666' }}>
                ${product.price.toFixed(2)}
              </Typography>
              <Rating value={product.ratings} readOnly size="small" precision={0.5} />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <FormControl size="small" sx={{ flex: 1 }}>
                  <InputLabel sx={{ fontFamily: 'Poppins, sans-serif' }}>Color</InputLabel>
                  <Select
                    value={selectedVariant.color}
                    label="Color"
                    onChange={(e) =>
                      handleVariantChange(product._id, e.target.value as string, selectedVariant.size)
                    }
                    onClick={(e) => e.stopPropagation()}
                    sx={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    {[...new Set(product.variants.map((v) => v.color))].map((color) => (
                      <MenuItem key={color} value={color} sx={{ fontFamily: 'Poppins, sans-serif' }}>
                        {color}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ flex: 1 }}>
                  <InputLabel sx={{ fontFamily: 'Poppins, sans-serif' }}>Size</InputLabel>
                  <Select
                    value={selectedVariant.size}
                    label="Size"
                    onChange={(e) =>
                      handleVariantChange(product._id, selectedVariant.color, e.target.value as string)
                    }
                    onClick={(e) => e.stopPropagation()}
                    sx={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    {[...new Set(product.variants.map((v) => v.size))].map((size) => (
                      <MenuItem key={size} value={size} sx={{ fontFamily: 'Poppins, sans-serif' }}>
                        {size}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<ShoppingCart size={16} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product._id, product.variants);
                  }}
                  disabled={cartLoading}
                  sx={{
                    bgcolor: '#4CAF50',
                    ':hover': { bgcolor: '#45a049' },
                    fontFamily: 'Poppins, sans-serif',
                    textTransform: 'none',
                    flex: 2,
                  }}
                >
                  Cart
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWishlistToggle(product._id, isInWishlist);
                  }}
                  disabled={addWishlistLoading || removeWishlistLoading}
                  sx={{
                    borderColor: '#4CAF50',
                    color: '#4CAF50',
                    fontFamily: 'Poppins, sans-serif',
                    textTransform: 'none',
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {isInWishlist ? <HeartOff size={16} /> : <Heart size={16} />}
                </Button>
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}