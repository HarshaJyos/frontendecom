'use client';

import { useState, useRef } from 'react';
import {
  Container,
  Box,
  Tabs,
  Tab,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ImagesIcon from '@mui/icons-material/Image';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAppSelector } from '@/redux/hooks';
import {
  useCreateProductMutation,
  useGetSellerProductsQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadProductImageMutation,
  useGetProductImagesQuery,
  useDeleteProductImageMutation,
  useGetSellerOrdersQuery,
  useUpdateOrderStatusMutation,
  useGetSellerAnalyticsQuery,
} from '@/redux/api';
import PrivateRoute from '@/components/PrivateRoute';
import { Product, Order } from '@/types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SellerDashboard() {
  const router = useRouter();
  const { isAuthenticated, user, loading: authLoading } = useAppSelector((state) => state.auth);
  const { products, orders, analytics } = useAppSelector((state) => state.seller);
  const [tabValue, setTabValue] = useState(0);
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    price: 0,
    stock: 0,
    categories: [] as string[],
    tags: [] as string[],
    variants: [{ color: '', size: '', price: 0, stock: 0 }],
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API queries and mutations
  const { isLoading: productsLoading, error: productsError } = useGetSellerProductsQuery({});
  const { isLoading: ordersLoading, error: ordersError } = useGetSellerOrdersQuery({});
  const { isLoading: analyticsLoading, error: analyticsError } = useGetSellerAnalyticsQuery({});
  const [createProduct, { isLoading: createProductLoading }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updateProductLoading }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: deleteProductLoading }] = useDeleteProductMutation();
  const [uploadProductImage, { isLoading: uploadImageLoading }] = useUploadProductImageMutation();
  const [deleteProductImage, { isLoading: deleteImageLoading }] = useDeleteProductImageMutation();
  const [updateOrderStatus, { isLoading: updateOrderStatusLoading }] = useUpdateOrderStatusMutation();

  // Fetch images for the selected product when dialog opens
  const { data: currentImages, isLoading: imagesLoading, error: imagesError } = useGetProductImagesQuery(
    selectedProduct?._id || '',
    { skip: !selectedProduct }
  );

  // Redirect non-sellers
  if (isAuthenticated && user?.role !== 'seller') {
    router.push('/profile');
    toast.error('Access restricted to sellers only');
    return null;
  }

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle product dialog open
  const handleOpenProductDialog = (product?: Product) => {
    if (product) {
      setSelectedProduct(product);
      setProductForm({
        title: product.title,
        description: product.description,
        price: product.price,
        stock: product.stock,
        categories: product.categories,
        tags: product.tags,
        variants: product.variants.length > 0 ? product.variants : [{ color: '', size: '', price: 0, stock: 0 }],
      });
    } else {
      setSelectedProduct(null);
      setProductForm({
        title: '',
        description: '',
        price: 0,
        stock: 0,
        categories: [],
        tags: [],
        variants: [{ color: '', size: '', price: 0, stock: 0 }],
      });
    }
    setOpenProductDialog(true);
  };

  // Handle product dialog close
  const handleCloseProductDialog = () => {
    setOpenProductDialog(false);
    setSelectedProduct(null);
  };

  // Handle product form submission
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedProduct) {
        await updateProduct({ productId: selectedProduct._id, ...productForm }).unwrap();
        toast.success('Product updated successfully');
      } else {
        await createProduct(productForm).unwrap();
        toast.success('Product created successfully');
      }
      setOpenProductDialog(false);
    } catch (error) {
        console.error(error);
      toast.error(selectedProduct ? 'Failed to update product' : 'Failed to create product');
    }
  };

  // Handle product deletion
  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId).unwrap();
      toast.success('Product deleted successfully');
    } catch (error) {
        console.error(error);
      toast.error('Failed to delete product');
    }
  };

  // Handle image dialog open
  const handleOpenImageDialog = (product: Product) => {
    setSelectedProduct(product);
    setImageFiles([]);
    setImagePreviews([]);
    setOpenImageDialog(true);
  };

  // Handle image dialog close
  const handleCloseImageDialog = () => {
    setOpenImageDialog(false);
    setSelectedProduct(null);
    setImageFiles([]);
    setImagePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter((file) => file.type.startsWith('image/'));
      if (validFiles.length !== files.length) {
        toast.error('Only image files are allowed');
      }
      setImageFiles(validFiles);

      // Generate previews
      const previews = validFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  // Handle image upload
  const handleImageUpload = async () => {
    if (!selectedProduct || imageFiles.length === 0) return;
    try {
      // Convert files to base64
      const base64Images = await Promise.all(
        imageFiles.map(
          (file) =>
            new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(file);
            })
        )
      );

      await uploadProductImage({ productId: selectedProduct._id, images: base64Images }).unwrap();
      toast.success('Images uploaded successfully');
      setImageFiles([]);
      setImagePreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
        console.error(error);
      toast.error('Failed to upload images');
    }
  };

  // Handle image deletion
  const handleDeleteImage = async (productId: string, imageUrl: string) => {
    try {
      await deleteProductImage({ productId, imageUrl }).unwrap();
      toast.success('Image deleted successfully');
    } catch (error) {
        console.error(error);
      toast.error('Failed to delete image');
    }
  };

  // Handle update order status
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus({ orderId, status }).unwrap();
      toast.success('Order status updated successfully');
    } catch (error) {
        console.error(error);
      toast.error('Failed to update order status');
    }
  };

  // Handle variant change
  const handleVariantChange = (index: number, field: string, value: string | number) => {
    const updatedVariants = [...productForm.variants];
    updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    setProductForm({ ...productForm, variants: updatedVariants });
  };

  // Add new variant
  const handleAddVariant = () => {
    setProductForm({
      ...productForm,
      variants: [...productForm.variants, { color: '', size: '', price: 0, stock: 0 }],
    });
  };

  // Remove variant
  const handleRemoveVariant = (index: number) => {
    setProductForm({
      ...productForm,
      variants: productForm.variants.filter((_, i) => i !== index),
    });
  };

  if (authLoading || productsLoading || ordersLoading || analyticsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (productsError || ordersError || analyticsError) {
    toast.error('Failed to load dashboard data');
    return null;
  }

  return (
    <PrivateRoute>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center', fontFamily: 'Poppins, sans-serif' }}>
          Seller Dashboard
        </Typography>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered sx={{ mb: 2 }}>
            <Tab label="Products" sx={{ fontFamily: 'Poppins, sans-serif' }} />
            <Tab label="Orders" sx={{ fontFamily: 'Poppins, sans-serif' }} />
            <Tab label="Analytics" sx={{ fontFamily: 'Poppins, sans-serif' }} />
          </Tabs>
        </Box>

        {/* Products Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif' }}>
              Manage Products
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenProductDialog()}
              sx={{ bgcolor: '#4CAF50', ':hover': { bgcolor: '#45a049' }, fontFamily: 'Poppins, sans-serif' }}
            >
              Add Product
            </Button>
          </Box>
          <TableContainer component={Paper} sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2 }}>
            <Table sx={{ minWidth: 650 }} aria-label="products table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>Title</TableCell>
                  <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>Price</TableCell>
                  <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>Stock</TableCell>
                  <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>Categories</TableCell>
                  <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products?.map((product: Product) => (
                  <TableRow key={product._id}>
                    <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>{product.title}</TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>${product.price}</TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>{product.stock}</TableCell>
                    <TableCell>
                      {product.categories.map((cat) => (
                        <Chip key={cat} label={cat} sx={{ mr: 0.5, fontFamily: 'Poppins, sans-serif' }} />
                      ))}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpenProductDialog(product)} sx={{ mr: 1 }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteProduct(product._id)}
                        disabled={deleteProductLoading}
                        sx={{ mr: 1 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                      <IconButton onClick={() => handleOpenImageDialog(product)}>
                        <ImagesIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Product Dialog */}
          <Dialog open={openProductDialog} onClose={handleCloseProductDialog}>
            <DialogTitle sx={{ fontFamily: 'Poppins, sans-serif' }}>
              {selectedProduct ? 'Edit Product' : 'Add Product'}
            </DialogTitle>
            <DialogContent>
              <Box
                component="form"
                onSubmit={handleProductSubmit}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}
              >
                <TextField
                  label="Title"
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  fullWidth
                  required
                  sx={{ fontFamily: 'Poppins, sans-serif' }}
                  InputLabelProps={{ style: { fontFamily: 'Poppins, sans-serif' } }}
                />
                <TextField
                  label="Description"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  fullWidth
                  multiline
                  rows={4}
                  sx={{ fontFamily: 'Poppins, sans-serif' }}
                  InputLabelProps={{ style: { fontFamily: 'Poppins, sans-serif' } }}
                />
                <TextField
                  label="Price"
                  type="number"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) })}
                  fullWidth
                  required
                  sx={{ fontFamily: 'Poppins, sans-serif' }}
                  InputLabelProps={{ style: { fontFamily: 'Poppins, sans-serif' } }}
                />
                <TextField
                  label="Stock"
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) })}
                  fullWidth
                  required
                  sx={{ fontFamily: 'Poppins, sans-serif' }}
                  InputLabelProps={{ style: { fontFamily: 'Poppins, sans-serif' } }}
                />
                <TextField
                  label="Categories (comma-separated)"
                  value={productForm.categories.join(',')}
                  onChange={(e) => setProductForm({ ...productForm, categories: e.target.value.split(',').map((c) => c.trim()) })}
                  fullWidth
                  sx={{ fontFamily: 'Poppins, sans-serif' }}
                  InputLabelProps={{ style: { fontFamily: 'Poppins, sans-serif' } }}
                />
                <TextField
                  label="Tags (comma-separated)"
                  value={productForm.tags.join(',')}
                  onChange={(e) => setProductForm({ ...productForm, tags: e.target.value.split(',').map((t) => t.trim()) })}
                  fullWidth
                  sx={{ fontFamily: 'Poppins, sans-serif' }}
                  InputLabelProps={{ style: { fontFamily: 'Poppins, sans-serif' } }}
                />
                <Typography variant="subtitle1" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                  Variants
                </Typography>
                {productForm.variants.map((variant, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField
                      label="Color"
                      value={variant.color}
                      onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                      size="small"
                      sx={{ fontFamily: 'Poppins, sans-serif' }}
                      InputLabelProps={{ style: { fontFamily: 'Poppins, sans-serif' } }}
                    />
                    <TextField
                      label="Size"
                      value={variant.size}
                      onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                      size="small"
                      sx={{ fontFamily: 'Poppins, sans-serif' }}
                      InputLabelProps={{ style: { fontFamily: 'Poppins, sans-serif' } }}
                    />
                    <TextField
                      label="Price"
                      type="number"
                      value={variant.price}
                      onChange={(e) => handleVariantChange(index, 'price', parseFloat(e.target.value))}
                      size="small"
                      sx={{ fontFamily: 'Poppins, sans-serif' }}
                      InputLabelProps={{ style: { fontFamily: 'Poppins, sans-serif' } }}
                    />
                    <TextField
                      label="Stock"
                      type="number"
                      value={variant.stock}
                      onChange={(e) => handleVariantChange(index, 'stock', parseInt(e.target.value))}
                      size="small"
                      sx={{ fontFamily: 'Poppins, sans-serif' }}
                      InputLabelProps={{ style: { fontFamily: 'Poppins, sans-serif' } }}
                    />
                    <IconButton onClick={() => handleRemoveVariant(index)} disabled={productForm.variants.length === 1}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  variant="outlined"
                  onClick={handleAddVariant}
                  sx={{ alignSelf: 'flex-start', color: '#4CAF50', borderColor: '#4CAF50', fontFamily: 'Poppins, sans-serif' }}
                >
                  Add Variant
                </Button>
                <DialogActions>
                  <Button onClick={handleCloseProductDialog} sx={{ color: '#4CAF50', fontFamily: 'Poppins, sans-serif' }}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={createProductLoading || updateProductLoading}
                    sx={{ bgcolor: '#4CAF50', ':hover': { bgcolor: '#45a049' }, fontFamily: 'Poppins, sans-serif' }}
                  >
                    {createProductLoading || updateProductLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : selectedProduct ? (
                      'Update Product'
                    ) : (
                      'Create Product'
                    )}
                  </Button>
                </DialogActions>
              </Box>
            </DialogContent>
          </Dialog>

          {/* Image Management Dialog */}
          <Dialog open={openImageDialog} onClose={handleCloseImageDialog}>
            <DialogTitle sx={{ fontFamily: 'Poppins, sans-serif' }}>Manage Product Images</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                {/* Existing Images */}
                <Typography variant="subtitle1" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                  Existing Images
                </Typography>
                {imagesLoading ? (
                  <CircularProgress size={24} sx={{ alignSelf: 'center' }} />
                ) : imagesError ? (
                  <Typography color="error" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                    Failed to load images
                  </Typography>
                ) : currentImages?.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                    {currentImages.map((imageUrl: string, index: number) => (
                      <Box key={index} sx={{ position: 'relative', width: 100, height: 100 }}>
                        <Image
                          src={imageUrl}
                          alt={`Product image ${index + 1}`}
                          fill
                          style={{ objectFit: 'cover', borderRadius: '4px' }}
                          sizes="100px"
                        />
                        <IconButton
                          onClick={() => handleDeleteImage(selectedProduct!._id, imageUrl)}
                          disabled={deleteImageLoading}
                          sx={{
                            position: 'absolute',
                            top: -10,
                            right: -10,
                            bgcolor: 'rgba(255, 255, 255, 0.8)',
                            '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' },
                          }}
                        >
                          <RemoveCircleIcon sx={{ color: '#FF0000' }} />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography sx={{ fontFamily: 'Poppins, sans-serif' }}>No images available</Typography>
                )}

                {/* Upload New Images */}
                <Typography variant="subtitle1" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                  Upload Files
                </Typography>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  style={{ marginTop: '8px' }}
                />
                {imageFiles.length > 0 && (
                  <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                    {imageFiles.length} image(s) selected
                  </Typography>
                )}
                {imagePreviews.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                    {imagePreviews.map((preview, index) => (
                      <Box key={index} sx={{ width: 100, height: 100 }}>
                        <Image
                          fill
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseImageDialog} sx={{ color: '#4CAF50', fontFamily: 'Poppins, sans-serif' }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleImageUpload}
                disabled={uploadImageLoading || imageFiles.length === 0}
                sx={{ bgcolor: '#4CAF50', ':hover': { bgcolor: '#45a049' }, fontFamily: 'Poppins, sans-serif' }}
              >
                {uploadImageLoading ? <CircularProgress size={24} color="inherit" /> : 'Upload Images'}
              </Button>
            </DialogActions>
          </Dialog>
        </TabPanel>

        {/* Orders Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Poppins, sans-serif' }}>
            Manage Orders
          </Typography>
          <TableContainer component={Paper} sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2 }}>
            <Table sx={{ minWidth: 650 }} aria-label="orders table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>Order ID</TableCell>
                  <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>Buyer</TableCell>
                  <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>Status</TableCell>
                  <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>Total Amount</TableCell>
                  <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders?.map((order: Order) => (
                  <TableRow key={order._id}>
                    <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>{order._id}</TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>{order.buyer}</TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>{order.status}</TableCell>
                    <TableCell sx={{ fontFamily: 'Poppins, sans-serif' }}>${order.totalAmount}</TableCell>
                    <TableCell>
                      <FormControl sx={{ minWidth: 120 }}>
                        <InputLabel sx={{ fontFamily: 'Poppins, sans-serif' }}>Status</InputLabel>
                        <Select
                          value=""
                          onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                          disabled={updateOrderStatusLoading}
                          sx={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                          <MenuItem value="pending" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                            Pending
                          </MenuItem>
                          <MenuItem value="processing" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                            Processing
                          </MenuItem>
                          <MenuItem value="shipped" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                            Shipped
                          </MenuItem>
                          <MenuItem value="delivered" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                            Delivered
                          </MenuItem>
                          <MenuItem value="cancelled" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                            Cancelled
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Poppins, sans-serif' }}>
            Analytics
          </Typography>
          {analytics && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Paper sx={{ p: 2, bgcolor: '#FFFFFF', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <Typography variant="subtitle1" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                  Total Income: ${analytics.totalIncome}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                  Product Count: {analytics.productCount}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                  Order Count: {analytics.orderCount}
                </Typography>
              </Paper>
              <Paper sx={{ p: 2, bgcolor: '#FFFFFF', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <Typography variant="subtitle1" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                  Top Products:
                </Typography>
                {analytics.topProducts.map((product) => (
                  <Box key={product._id} sx={{ mt: 1 }}>
                    <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                      {product.title} - ${product.price}
                    </Typography>
                  </Box>
                ))}
              </Paper>
            </Box>
          )}
        </TabPanel>
      </Container>
    </PrivateRoute>
  );
}
/* Removed local updateOrderStatus function as we use the RTK Query mutation hook */

