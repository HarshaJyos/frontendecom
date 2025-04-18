'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Chip,
  Rating,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
} from '@mui/material';
import { ShoppingCart, Heart, HeartOff } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useAppSelector } from '@/redux/hooks';
import {
  useGetProductQuery,
  useGetProductReviewsQuery,
  useAddToCartMutation,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} from '@/redux/api';
import {  Review } from '@/types';

export default function ProductDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const {  isAuthenticated } = useAppSelector((state) => state.auth);
  const { wishlist } = useAppSelector((state) => state.buyer);
  const { data: product, isLoading, error } = useGetProductQuery(id as string);
  const { data: reviews, isLoading: reviewsLoading } = useGetProductReviewsQuery(id as string);
  const [addToCart, { isLoading: cartLoading }] = useAddToCartMutation();
  const [addToWishlist, { isLoading: addWishlistLoading }] = useAddToWishlistMutation();
  const [removeFromWishlist, { isLoading: removeWishlistLoading }] = useRemoveFromWishlistMutation();
  const [selectedVariant, setSelectedVariant] = useState({ color: '', size: '' });
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (error) {
        console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    }
    if (product && product.variants.length > 0) {
      setSelectedVariant({ color: product.variants[0].color, size: product.variants[0].size });
    }
    if (product && product.images.length > 0) {
      setSelectedImage(0);
    }
  }, [error, product]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to cart');
      router.push('/login');
      return;
    }
    if (!product) return;
    const variantIndex = product.variants.findIndex(
      (v:{ color: string; size: string; price: number; stock: number }) => v.color === selectedVariant.color && v.size === selectedVariant.size
    );
    if (variantIndex === -1) {
      toast.error('Invalid variant selected');
      return;
    }
    try {
      await addToCart({ product: id as string, variant: variantIndex, quantity: 1 }).unwrap();
      toast.success('Added to cart');
    } catch (error) {
        console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to manage wishlist');
      router.push('/login');
      return;
    }
    const isInWishlist = wishlist.includes(id as string);
    try {
      if (isInWishlist) {
        await removeFromWishlist(id as string).unwrap();
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist({ productId: id as string }).unwrap();
        toast.success('Added to wishlist');
      }
    } catch (error) {
        console.error('Error updating wishlist:', error);
      toast.error('Failed to update wishlist');
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to proceed to checkout');
      router.push('/login');
      return;
    }
    if (!product) return;
    const variantIndex = product.variants.findIndex(
      (v:{ color: string; size: string; price: number; stock: number }) => v.color === selectedVariant.color && v.size === selectedVariant.size
    );
    if (variantIndex === -1) {
      toast.error('Invalid variant selected');
      return;
    }
    router.push(`/checkout/${id}?variantIndex=${variantIndex}`);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography sx={{ fontFamily: 'Poppins, sans-serif', textAlign: 'center' }}>
          Product not found
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ position: 'relative', height: { xs: 300, md: 400 }, width: '100%' }}>
            <Image
              src={product.images[selectedImage] || '/images/placeholder.png'}
              alt={product.title}
              fill
              style={{ objectFit: 'contain', borderRadius: 8 }}
              sizes="(max-width: 960px) 100vw, 50vw"
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
          {product.images.map((image: string, index: number) => (
              <Box
                key={index}
                sx={{
                  position: 'relative',
                  width: 80,
                  height: 80,
                  border: selectedImage === index ? '2px solid #4CAF50' : '1px solid #eee',
                  borderRadius: 1,
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedImage(index)}
              >
                <Image
                  src={image || '/images/placeholder.png'}
                  alt={`${product.title} thumbnail ${index}`}
                  fill
                  style={{ objectFit: 'cover', borderRadius: 1 }}
                  sizes="80px"
                />
              </Box>
            ))}
          </Box>
        </Box>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography
            variant="h4"
            sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 'bold' }}
          >
            {product.title}
          </Typography>
          <Typography variant="body1" sx={{ fontFamily: 'Poppins, sans-serif', color: '#666' }}>
            {product.description}
          </Typography>
          <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif' }}>
            ${product.price.toFixed(2)}
          </Typography>
          <Rating value={product.ratings} readOnly precision={0.5} />
          <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif' }}>
            Stock: {product.stock}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {product.categories.map((category:string) => (
              <Chip
                key={category}
                label={category}
                sx={{ fontFamily: 'Poppins, sans-serif' }}
              />
            ))}
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {product.tags.map((tag:string) => (
              <Chip
                key={tag}
                label={tag}
                variant="outlined"
                sx={{ fontFamily: 'Poppins, sans-serif' }}
              />
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel sx={{ fontFamily: 'Poppins, sans-serif' }}>Color</InputLabel>
              <Select
                value={selectedVariant.color}
                label="Color"
                onChange={(e) => setSelectedVariant({ ...selectedVariant, color: e.target.value as string })}
                sx={{ fontFamily: 'Poppins, sans-serif' }}
              >
                {[...new Set(product.variants.map((v:{ color: string; size: string; price: number; stock: number }) => v.color))].map((color) => (
                  <MenuItem key={color as string} value={color as string} sx={{ fontFamily: 'Poppins, sans-serif' }}>
                    {color as string}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel sx={{ fontFamily: 'Poppins, sans-serif' }}>Size</InputLabel>
              <Select
                value={selectedVariant.size}
                label="Size"
                onChange={(e) => setSelectedVariant({ ...selectedVariant, size: e.target.value as string })}
                sx={{ fontFamily: 'Poppins, sans-serif' }}
              >
                {[...new Set(product.variants.map((v:{ color: string; size: string; price: number; stock: number }) => v.size))].map((size) => (
                  <MenuItem key={String(size)} value={String(size)} sx={{ fontFamily: 'Poppins, sans-serif' }}>
                    {String(size)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Button
              variant="contained"
              startIcon={<ShoppingCart size={16} />}
              onClick={handleAddToCart}
              disabled={cartLoading}
              sx={{
                bgcolor: '#4CAF50',
                ':hover': { bgcolor: '#45a049' },
                fontFamily: 'Poppins, sans-serif',
                textTransform: 'none',
                flex: 1,
              }}
            >
              Add to Cart
            </Button>
            <Button
              variant="outlined"
              onClick={handleWishlistToggle}
              disabled={addWishlistLoading || removeWishlistLoading}
              sx={{
                borderColor: '#4CAF50',
                color: '#4CAF50',
                fontFamily: 'Poppins, sans-serif',
                textTransform: 'none',
                flex: 1,
              }}
            >
              {wishlist.includes(id as string) ? <HeartOff size={16} /> : <Heart size={16} />}
            </Button>
            <Button
              variant="contained"
              onClick={handleBuyNow}
              sx={{
                bgcolor: '#4CAF50',
                ':hover': { bgcolor: '#45a049' },
                fontFamily: 'Poppins, sans-serif',
                textTransform: 'none',
                flex: 1,
              }}
            >
              Buy Now
            </Button>
          </Box>
        </Box>
      </Box>
      <Divider sx={{ my: 4 }} />
      <Typography
        variant="h5"
        sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 'bold', mb: 2 }}
      >
        Reviews
      </Typography>
      {reviewsLoading ? (
        <CircularProgress />
      ) : reviews && reviews.length > 0 ? (
        reviews.map((review: Review) => (
          <Box key={review._id} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
            <Rating value={review.rating} readOnly size="small" />
            <Typography sx={{ fontFamily: 'Poppins, sans-serif', mt: 1 }}>
              {review.comment || 'No comment'}
            </Typography>
            <Typography sx={{ fontFamily: 'Poppins, sans-serif', color: '#666', mt: 1 }}>
              {new Date(review.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        ))
      ) : (
        <Typography sx={{ fontFamily: 'Poppins, sans-serif' }}>No reviews yet</Typography>
      )}
    </Container>
  );
}