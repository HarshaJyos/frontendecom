// src/app/admin/dashboard/page.tsx
"use client";

import { useState } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAppSelector } from "@/redux/hooks";
import {
  useGetUsersQuery,
  useApproveSellerMutation,
  useApproveDeliveryBoyMutation,
  useGetAdminOrdersQuery,
  useAssignDeliveryBoyMutation,
  useUpdateAdminOrderStatusMutation,
  useGetAdminAnalyticsQuery,
} from "@/redux/api";
import PrivateRoute from "@/components/PrivateRoute";
import { User, Order } from "@/types";

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

export default function AdminDashboard() {
  const router = useRouter();
  const {
    isAuthenticated,
    user,
    loading: authLoading,
  } = useAppSelector((state) => state.auth);
  const [tabValue, setTabValue] = useState(0);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedDeliveryBoyId, setSelectedDeliveryBoyId] =
    useState<string>("");

  // API queries and mutations
  const {
    data: users,
    isLoading: usersLoading,
    error: usersError,
  } = useGetUsersQuery({});
  const {
    data: orders,
    isLoading: ordersLoading,
    error: ordersError,
  } = useGetAdminOrdersQuery({});
  const {
    data: analytics,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useGetAdminAnalyticsQuery({});
  const [approveSeller, { isLoading: approveSellerLoading }] =
    useApproveSellerMutation();
  const [approveDeliveryBoy, { isLoading: approveDeliveryBoyLoading }] =
    useApproveDeliveryBoyMutation();
  const [assignDeliveryBoy, { isLoading: assignDeliveryBoyLoading }] =
    useAssignDeliveryBoyMutation();
  const [updateAdminOrderStatus, { isLoading: updateOrderStatusLoading }] =
    useUpdateAdminOrderStatusMutation();

  // Redirect non-admins
  if (isAuthenticated && user?.role !== "admin") {
    router.push("/profile");
    toast.error("Access restricted to admins only");
    return null;
  }

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle seller approval
  const handleApproveSeller = async (sellerId: string) => {
    try {
      await approveSeller(sellerId).unwrap();
      toast.success("Seller approved successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to approve seller");
    }
  };

  // Handle delivery boy approval
  const handleApproveDeliveryBoy = async (deliveryBoyId: string) => {
    try {
      await approveDeliveryBoy(deliveryBoyId).unwrap();
      toast.success("Delivery boy approved successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to approve delivery boy");
    }
  };

  // Handle assign delivery boy
  const handleAssignDeliveryBoy = async () => {
    if (!selectedOrderId || !selectedDeliveryBoyId) return;
    try {
      await assignDeliveryBoy({
        orderId: selectedOrderId,
        deliveryBoyId: selectedDeliveryBoyId,
      }).unwrap();
      toast.success("Delivery boy assigned successfully");
      setOpenAssignDialog(false);
      setSelectedOrderId(null);
      setSelectedDeliveryBoyId("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to assign delivery boy");
    }
  };

  // Handle update order status
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateAdminOrderStatus({ orderId, status }).unwrap();
      toast.success("Order status updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update order status");
    }
  };

  // Open assign delivery boy dialog
  const handleOpenAssignDialog = (orderId: string) => {
    setSelectedOrderId(orderId);
    setOpenAssignDialog(true);
  };

  // Close assign delivery boy dialog
  const handleCloseAssignDialog = () => {
    setOpenAssignDialog(false);
    setSelectedOrderId(null);
    setSelectedDeliveryBoyId("");
  };

  if (authLoading || usersLoading || ordersLoading || analyticsLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (usersError || ordersError || analyticsError) {
    toast.error("Failed to load dashboard data");
    return null;
  }

  return (
    <PrivateRoute>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography
          variant="h4"
          sx={{ mb: 4, fontWeight: "bold", textAlign: "center" }}
        >
          Admin Dashboard
        </Typography>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            centered
            sx={{ mb: 2 }}
          >
            <Tab label="Users" />
            <Tab label="Orders" />
            <Tab label="Analytics" />
          </Tabs>
        </Box>

        {/* Users Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Manage Users
          </Typography>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="users table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users?.map((user: User) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.status}</TableCell>
                    <TableCell>
                      {user.role === "seller" && user.status === "pending" && (
                        <Button
                          variant="contained"
                          onClick={() => handleApproveSeller(user._id)}
                          disabled={approveSellerLoading}
                          sx={{
                            bgcolor: "#4CAF50",
                            ":hover": { bgcolor: "#45a049" },
                            mr: 1,
                          }}
                        >
                          Approve Seller
                        </Button>
                      )}
                      {user.role === "delivery" &&
                        user.status === "pending" && (
                          <Button
                            variant="contained"
                            onClick={() => handleApproveDeliveryBoy(user._id)}
                            disabled={approveDeliveryBoyLoading}
                            sx={{
                              bgcolor: "#4CAF50",
                              ":hover": { bgcolor: "#45a049" },
                            }}
                          >
                            Approve Delivery
                          </Button>
                        )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Orders Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Manage Orders
          </Typography>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="orders table">
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Buyer</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Delivery Boy</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders?.map((order: Order) => (
                  <TableRow key={order._id}>
                    <TableCell>{order._id}</TableCell>
                    {/* Fix: Display the buyer's name instead of the entire buyer object */}
                    <TableCell>
                      {order.buyer && typeof order.buyer === "object" && "name" in order.buyer
                        ? (order.buyer as { name?: string; _id?: string }).name ||
                          (order.buyer as { _id?: string })._id ||
                          "Unknown"
                        : order.buyer || "Unknown"}
                    </TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell>${order.totalAmount}</TableCell>
                    <TableCell>
                      {/* Check if deliveryBoy is an object, if so, extract name or ID */}
                      {order.deliveryBoy && typeof order.deliveryBoy === "object" && "name" in order.deliveryBoy
                        ? (order.deliveryBoy as { name?: string; _id?: string }).name ||
                          (order.deliveryBoy as { _id?: string })._id ||
                          "Unassigned"
                        : order.deliveryBoy || "Unassigned"}
                    </TableCell>
                    <TableCell>
                      <FormControl sx={{ minWidth: 120, mr: 1 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value=""
                          onChange={(e) =>
                            handleUpdateOrderStatus(order._id, e.target.value)
                          }
                          disabled={updateOrderStatusLoading}
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="processing">Processing</MenuItem>
                          <MenuItem value="shipped">Shipped</MenuItem>
                          <MenuItem value="delivered">Delivered</MenuItem>
                          <MenuItem value="cancelled">Cancelled</MenuItem>
                        </Select>
                      </FormControl>
                      <Button
                        variant="outlined"
                        onClick={() => handleOpenAssignDialog(order._id)}
                        sx={{ color: "#4CAF50", borderColor: "#4CAF50" }}
                      >
                        Assign Delivery
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Assign Delivery Boy Dialog */}
          <Dialog open={openAssignDialog} onClose={handleCloseAssignDialog}>
            <DialogTitle>Assign Delivery Boy</DialogTitle>
            <DialogContent>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Delivery Boy</InputLabel>
                <Select
                  value={selectedDeliveryBoyId}
                  onChange={(e) => setSelectedDeliveryBoyId(e.target.value)}
                  label="Delivery Boy"
                >
                  {users
                    ?.filter(
                      (u: User) =>
                        u.role === "delivery" && u.status === "active"
                    )
                    .map((u: User) => (
                      <MenuItem key={u._id} value={u._id}>
                        {u.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleCloseAssignDialog}
                sx={{ color: "#4CAF50" }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleAssignDeliveryBoy}
                disabled={assignDeliveryBoyLoading || !selectedDeliveryBoyId}
                sx={{ bgcolor: "#4CAF50", ":hover": { bgcolor: "#45a049" } }}
              >
                {assignDeliveryBoyLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Assign"
                )}
              </Button>
            </DialogActions>
          </Dialog>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Analytics
          </Typography>
          {analytics && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: "#FFFFFF",
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <Typography variant="subtitle1">
                  Total Users: {analytics.totalUsers}
                </Typography>
                <Typography variant="subtitle2" sx={{ mt: 1 }}>
                  Users by Role:
                </Typography>
                {analytics.usersByRole.map(
                  (role: { _id: string; count: number }) => (
                    <Typography key={role._id} variant="body2">
                      {role._id}: {role.count}
                    </Typography>
                  )
                )}
              </Paper>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: "#FFFFFF",
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <Typography variant="subtitle1">
                  Total Revenue: ${analytics.totalRevenue}
                </Typography>
                <Typography variant="subtitle2" sx={{ mt: 1 }}>
                  Orders by Status:
                </Typography>
                {analytics.ordersByStatus.map(
                  (status: { _id: string; count: number }) => (
                    <Typography key={status._id} variant="body2">
                      {status._id}: {status.count}
                    </Typography>
                  )
                )}
              </Paper>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: "#FFFFFF",
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <Typography variant="subtitle1">Top Products:</Typography>
                {analytics.topProducts.map(
                  (product: {
                    _id: string;
                    title: string;
                    seller: { name: string };
                    price: number;
                  }) => (
                    <Box key={product._id} sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        {product.title} (Seller: {product.seller.name}) - $
                        {product.price}
                      </Typography>
                    </Box>
                  )
                )}
              </Paper>
            </Box>
          )}
        </TabPanel>
      </Container>
    </PrivateRoute>
  );
}