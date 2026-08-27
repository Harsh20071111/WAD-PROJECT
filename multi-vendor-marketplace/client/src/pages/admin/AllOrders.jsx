import React, { useState, useEffect } from 'react';
import { listAllOrders } from '../../services/admin';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import { ShoppingBag, Store, User, Calendar, MapPin } from 'lucide-react';

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await listAllOrders();
        if (data && data.orders) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error('Error fetching all orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const totalVolume = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-purple-600" />
            Platform-Wide Orders
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Global view of all orders placed across all local vendors.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-gray-500">Gross Marketplace Volume</span>
          <p className="text-xl font-bold text-gray-900">${totalVolume.toFixed(2)}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center shadow-sm max-w-md mx-auto">
          <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900">No Orders in Platform</h3>
          <p className="text-xs text-gray-500 mt-1">No orders have been recorded in the database yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Order ID & Date</th>
                  <th className="px-6 py-3.5">Vendor Shop</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Items</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4">
                      <p className="font-mono font-bold text-gray-900">#{o._id.slice(-6)}</p>
                      <p className="text-[11px] text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</p>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-semibold text-gray-900">
                        <Store className="w-3.5 h-3.5 text-emerald-600" />
                        {o.shopId?.shopName || 'Unknown Shop'}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{o.buyerId?.name || 'Customer'}</p>
                      <p className="text-[11px] text-gray-400">{o.buyerId?.email}</p>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-700">
                        {o.products.length} product(s)
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">${o.totalAmount.toFixed(2)}</span>
                    </td>

                    <td className="px-6 py-4">
                      <OrderStatusBadge status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllOrders;
