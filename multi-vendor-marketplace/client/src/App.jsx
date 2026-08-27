import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Buyer Pages
import ShopList from './pages/buyer/ShopList';
import ShopPage from './pages/buyer/ShopPage';
import Cart from './pages/buyer/Cart';
import Checkout from './pages/buyer/Checkout';
import Orders from './pages/buyer/Orders';

// Seller Pages
import Dashboard from './pages/seller/Dashboard';
import ShopSettings from './pages/seller/ShopSettings';
import AddProduct from './pages/seller/AddProduct';
import MyProducts from './pages/seller/MyProducts';
import MyOrders from './pages/seller/MyOrders';

// Admin Pages
import ApproveShops from './pages/admin/ApproveShops';
import ManageCategories from './pages/admin/ManageCategories';
import AllOrders from './pages/admin/AllOrders';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Navbar />

        <main className="flex-1 pb-16">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<ShopList />} />
            <Route path="/shops/:shopId" element={<ShopPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Buyer Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['buyer']} />}>
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
            </Route>

            {/* Seller Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['seller']} />}>
              <Route path="/seller/dashboard" element={<Dashboard />} />
              <Route path="/seller/settings" element={<ShopSettings />} />
              <Route path="/seller/add-product" element={<AddProduct />} />
              <Route path="/seller/products" element={<MyProducts />} />
              <Route path="/seller/orders" element={<MyOrders />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/approve-shops" element={<ApproveShops />} />
              <Route path="/admin/categories" element={<ManageCategories />} />
              <Route path="/admin/orders" element={<AllOrders />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
