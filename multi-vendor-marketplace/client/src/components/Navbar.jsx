import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  Store, 
  ShoppingCart, 
  User, 
  LogOut, 
  Package, 
  LayoutDashboard, 
  ShieldCheck, 
  PlusCircle, 
  Settings,
  Menu,
  X
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-200 group-hover:bg-emerald-700 transition">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">Local<span className="text-emerald-600">Mart</span></span>
              <span className="block text-[10px] uppercase font-semibold text-gray-400 -mt-1 tracking-wider">Local Marketplace</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition">
              Explore Shops
            </Link>

            {/* Buyer Links */}
            {isAuthenticated && user?.role === 'buyer' && (
              <>
                <Link to="/orders" className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-gray-500" />
                  My Orders
                </Link>
                <Link to="/cart" className="relative p-2 text-gray-700 hover:text-emerald-600 transition flex items-center gap-1.5 font-medium text-sm">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Cart</span>
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                      {itemCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {/* Seller Links */}
            {isAuthenticated && user?.role === 'seller' && (
              <>
                <Link to="/seller/dashboard" className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition flex items-center gap-1.5">
                  <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                  Dashboard
                </Link>
                <Link to="/seller/products" className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition">
                  My Products
                </Link>
                <Link to="/seller/orders" className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition">
                  Shop Orders
                </Link>
                <Link to="/seller/settings" className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition flex items-center gap-1">
                  <Settings className="w-4 h-4" />
                  Shop Info
                </Link>
              </>
            )}

            {/* Admin Links */}
            {isAuthenticated && user?.role === 'admin' && (
              <>
                <Link to="/admin/approve-shops" className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  Shop Approvals
                </Link>
                <Link to="/admin/categories" className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition">
                  Categories
                </Link>
                <Link to="/admin/orders" className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition">
                  All Orders
                </Link>
              </>
            )}
          </nav>

          {/* User Profile / Auth Action */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-semibold text-gray-900 leading-none">{user?.name}</span>
                  <span className="text-xs text-emerald-600 capitalize font-medium mt-0.5">{user?.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-emerald-600 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated && user?.role === 'buyer' && (
              <Link to="/cart" className="relative p-2 text-gray-700">
                <ShoppingCart className="w-6 h-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
          >
            Explore Shops
          </Link>

          {isAuthenticated && user?.role === 'buyer' && (
            <Link
              to="/orders"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              My Orders
            </Link>
          )}

          {isAuthenticated && user?.role === 'seller' && (
            <>
              <Link
                to="/seller/dashboard"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                Dashboard
              </Link>
              <Link
                to="/seller/products"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                My Products
              </Link>
              <Link
                to="/seller/orders"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                Shop Orders
              </Link>
              <Link
                to="/seller/settings"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                Shop Settings
              </Link>
            </>
          )}

          {isAuthenticated && user?.role === 'admin' && (
            <>
              <Link
                to="/admin/approve-shops"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                Shop Approvals
              </Link>
              <Link
                to="/admin/categories"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                Categories
              </Link>
              <Link
                to="/admin/orders"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                All Orders
              </Link>
            </>
          )}

          <div className="pt-4 border-t border-gray-100">
            {isAuthenticated ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
