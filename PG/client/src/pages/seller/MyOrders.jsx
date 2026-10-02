import React, { useState, useEffect } from 'react';
import { getShopOrders, updateOrderStatus } from '../../services/order';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import { ShoppingBag, MapPin, User, Phone, CheckCircle } from 'lucide-react';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getShopOrders();
      if (data && data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Error fetching shop orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      const res = await updateOrderStatus(orderId, newStatus);
      if (res && res.order) {
        setOrders(orders.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Incoming Shop Orders
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Fulfill and update order statuses for purchases from your store.
          </p>
        </div>
        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
          {orders.length} Total Orders
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center shadow-sm max-w-md mx-auto">
          <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900">No Orders Yet</h3>
          <p className="text-xs text-gray-500 mt-1">When buyers order products from your store, they will show up here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Order Top Bar */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Order ID</span>
                    <span className="text-xs font-mono font-bold text-gray-800">#{order._id.slice(-8)}</span>
                  </div>
                  <div className="border-l border-gray-200 pl-4">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Date</span>
                    <span className="text-xs text-gray-600">{new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <OrderStatusBadge status={order.status} />

                  {/* Status Dropdown */}
                  <select
                    value={order.status}
                    disabled={updatingId === order._id}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="text-xs font-semibold border border-gray-300 rounded-lg px-2.5 py-1 bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="placed">Placed</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Order Body */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Items */}
                <div className="md:col-span-2 space-y-2">
                  <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">
                    Ordered Products ({order.products.length})
                  </h4>
                  {order.products.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
                      <div>
                        <span className="font-bold text-gray-900">{p.quantity}x</span> {p.name}
                      </div>
                      <span className="font-semibold text-gray-700">${(p.price * p.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="pt-2 flex justify-between font-bold text-xs text-gray-900">
                    <span>Order Total:</span>
                    <span className="text-emerald-700 text-sm">${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Buyer / Delivery Info */}
                <div className="bg-gray-50/80 p-4 rounded-xl space-y-2 text-xs">
                  <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider">Customer Details</h4>
                  <p className="flex items-center gap-1.5 text-gray-800 font-semibold">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    {order.buyerId?.name || 'Local Customer'}
                  </p>
                  {order.buyerId?.phone && (
                    <p className="flex items-center gap-1.5 text-gray-600">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {order.buyerId?.phone}
                    </p>
                  )}
                  <p className="flex items-start gap-1.5 text-gray-600 pt-1 border-t border-gray-200/60">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{order.deliveryAddress}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
