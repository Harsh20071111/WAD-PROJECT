import React, { useState, useEffect } from 'react';
import { getMyOrders } from '../../services/order';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import { Package, Store, Calendar, MapPin, Clock } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const newOrderCount = location.state?.newOrderCount;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getMyOrders();
        if (data && data.orders) {
          setOrders(data.orders);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {newOrderCount && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-xs font-semibold">
          <Package className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>Success! {newOrderCount} order(s) have been placed and sent to the corresponding local vendors.</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            My Orders
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Track real-time status and delivery updates for all your marketplace orders.
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
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900">No Orders Found</h3>
          <p className="text-xs text-gray-500 mt-1">You haven't placed any orders with local vendors yet.</p>
          <Link
            to="/"
            className="inline-block mt-5 px-5 py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition"
          >
            Explore Local Shops
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Order Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Order ID</span>
                    <span className="text-xs font-mono font-bold text-gray-800">#{order._id.slice(-8)}</span>
                  </div>

                  <div className="border-l border-gray-200 pl-4">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Vendor Shop</span>
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <Store className="w-3.5 h-3.5" />
                      {order.shopId?.shopName || 'Local Shop'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6 divide-y divide-gray-100">
                {order.products.map((p, idx) => (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                          <Package className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{p.name}</p>
                        <p className="text-gray-400 text-[11px]">Quantity: {p.quantity} × ${p.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-800">${(p.price * p.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="bg-gray-50/50 px-6 py-3 border-t border-gray-100 flex flex-wrap items-center justify-between text-xs text-gray-600 gap-2">
                <div className="flex items-center gap-1 text-gray-500">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>Delivering to: <strong className="text-gray-800">{order.deliveryAddress}</strong></span>
                </div>
                <div>
                  <span>Total Amount: </span>
                  <strong className="text-sm font-bold text-gray-900">${order.totalAmount.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
