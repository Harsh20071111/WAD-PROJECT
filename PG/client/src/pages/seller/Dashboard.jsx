import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyShop } from '../../services/shop';
import { getMyProducts } from '../../services/product';
import { getShopOrders } from '../../services/order';
import { 
  Store, 
  Package, 
  ShoppingBag, 
  DollarSign, 
  PlusCircle, 
  Settings, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';

const Dashboard = () => {
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        setLoading(true);
        const shopRes = await getMyShop();
        setShop(shopRes.shop);

        if (shopRes.shop) {
          const [prodsRes, ordsRes] = await Promise.all([
            getMyProducts(),
            getShopOrders(),
          ]);
          setProducts(prodsRes.products || []);
          setOrders(ordsRes.orders || []);
        }
      } catch (error) {
        console.error('Error fetching seller dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // If no shop created yet
  if (!shop) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border border-gray-200 p-10 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Set Up Your Local Shop</h2>
          <p className="text-xs text-gray-500 mt-2">
            You don't have a registered shop profile yet. Create your shop to start listing products.
          </p>
          <Link
            to="/seller/settings"
            className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 bg-emerald-600 text-white font-semibold text-xs rounded-xl hover:bg-emerald-700 transition"
          >
            Create Shop Profile
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrders = orders.filter((o) => o.status === 'placed' || o.status === 'confirmed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Shop Status Banner */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {shop.shopLogo ? (
            <img src={shop.shopLogo} alt={shop.shopName} className="w-16 h-16 rounded-2xl object-cover border border-gray-100 shadow-sm" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Store className="w-8 h-8" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{shop.shopName}</h1>
              {shop.isApproved ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  Live & Approved
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  <AlertCircle className="w-3 h-3" />
                  Pending Admin Approval
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">{shop.address || 'No address specified'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/seller/add-product"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            Add Product
          </Link>
          <Link
            to="/seller/settings"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition"
          >
            <Settings className="w-4 h-4" />
            Edit Shop
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 block">Total Revenue</span>
            <span className="text-2xl font-bold text-gray-900 mt-1 block">${totalRevenue.toFixed(2)}</span>
            <span className="text-[10px] text-emerald-600 font-medium mt-1 inline-flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> Completed sales
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 block">Active Products</span>
            <span className="text-2xl font-bold text-gray-900 mt-1 block">{products.length}</span>
            <Link to="/seller/products" className="text-[10px] text-emerald-600 hover:underline mt-1 block font-medium">
              Manage inventory &rarr;
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 block">Total Orders</span>
            <span className="text-2xl font-bold text-gray-900 mt-1 block">{orders.length}</span>
            <Link to="/seller/orders" className="text-[10px] text-emerald-600 hover:underline mt-1 block font-medium">
              View all orders &rarr;
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 block">Pending Fulfillment</span>
            <span className="text-2xl font-bold text-amber-600 mt-1 block">{pendingOrders}</span>
            <span className="text-[10px] text-gray-400 font-medium mt-1 block">Requires action</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Orders Preview */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900">Recent Customer Orders</h2>
          <Link to="/seller/orders" className="text-xs font-semibold text-emerald-600 hover:underline">
            View All Orders
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500">
            No orders received yet for this store.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {orders.slice(0, 5).map((order) => (
              <div key={order._id} className="p-4 sm:px-6 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-gray-900">Order #{order._id.slice(-6)}</p>
                  <p className="text-gray-500 text-[11px] mt-0.5">
                    Customer: {order.buyerId?.name || 'Local Buyer'} • {order.products.length} item(s)
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">${order.totalAmount.toFixed(2)}</p>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
