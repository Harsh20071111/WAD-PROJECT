import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { placeOrder } from '../../services/order';
import { Store, MapPin, CheckCircle, ArrowLeft, ShieldCheck } from 'lucide-react';

const Checkout = () => {
  const { user } = useAuth();
  const { items, subtotal, groupedByShop, clearCart } = useCart();
  const navigate = useNavigate();

  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!items || items.length === 0) {
    navigate('/cart');
    return null;
  }

  const shopEntries = Object.entries(groupedByShop);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!deliveryAddress.trim()) {
      setError('Please provide a valid delivery address');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const res = await placeOrder({ deliveryAddress });
      if (res && res.success) {
        // Refresh or clear local cart context
        await clearCart();
        navigate('/orders', { state: { newOrderCount: res.orders?.length || 1 } });
      }
    } catch (err) {
      console.error('Order placement error:', err);
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <button
        onClick={() => navigate('/cart')}
        className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-emerald-600 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Cart
      </button>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
        Checkout & Place Order
      </h1>
      <p className="text-xs text-gray-500 mt-1">
        Review your order and specify your local delivery destination.
      </p>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column: Address & Shop Breakdown */}
        <div className="md:col-span-2 space-y-6">
          {/* Address input */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Delivery Destination
            </h3>
            <textarea
              required
              rows={3}
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Enter full street address, apartment/suite number, city, and zip code..."
              className="w-full p-3 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Vendors & Orders separation note */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">
                Vendor Order Packages ({shopEntries.length})
              </h3>
              <span className="text-[11px] text-gray-500">Separated per seller</span>
            </div>

            {shopEntries.map(([shopId, group], index) => (
              <div key={shopId} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between text-xs font-bold text-gray-800 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Package {index + 1}: {group.shop?.shopName}</span>
                  </div>
                  <span className="text-emerald-700">${group.shopTotal.toFixed(2)}</span>
                </div>
                <div className="space-y-1 text-[11px] text-gray-600">
                  {group.items.map((item) => (
                    <div key={item._id} className="flex justify-between">
                      <span>{item.quantity}x {item.productId?.name}</span>
                      <span>${((item.productId?.price || 0) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Final Summary & Confirm */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-24 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 pb-3 border-b border-gray-100">
              Payment on Delivery
            </h3>

            <div className="space-y-2.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="text-emerald-600 font-semibold">FREE</span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between font-bold text-gray-900 text-sm">
                <span>Total Due</span>
                <span className="text-emerald-700 text-base">${subtotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-2 text-[11px] text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>Orders are dispatched directly by each shop upon seller confirmation.</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              {submitting ? 'Placing Orders...' : 'Confirm & Place Order'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
