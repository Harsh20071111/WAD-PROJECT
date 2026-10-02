import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import CartItem from '../../components/CartItem';
import { ShoppingBag, ArrowRight, Trash2, Store } from 'lucide-react';

const Cart = () => {
  const { cart, items, subtotal, groupedByShop, updateQty, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  if (!items || items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border border-gray-200 p-10 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Your Cart is Empty</h2>
          <p className="text-sm text-gray-500 mt-2">
            Looks like you haven't added any products from local vendors yet.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-emerald-600 text-white font-semibold text-sm rounded-xl hover:bg-emerald-700 transition shadow-sm"
          >
            Start Exploring Shops
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const shopEntries = Object.entries(groupedByShop);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Items are organized by vendor. At checkout, separate orders will be placed per shop.
          </p>
        </div>
        <button
          onClick={clearCart}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items Grouped by Shop */}
        <div className="lg:col-span-2 space-y-6">
          {shopEntries.map(([shopId, group]) => (
            <div key={shopId} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Shop Header */}
              <div className="bg-gray-50/80 px-6 py-3 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-bold text-gray-900">
                    {group.shop?.shopName || 'Local Shop'}
                  </span>
                </div>
                <span className="text-xs font-semibold text-gray-500">
                  Shop Subtotal: <strong className="text-gray-900">${group.shopTotal.toFixed(2)}</strong>
                </span>
              </div>

              {/* Items List */}
              <div className="px-6 divide-y divide-gray-100">
                {group.items.map((item) => (
                  <CartItem
                    key={item._id}
                    item={item}
                    onUpdateQty={updateQty}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-24">
            <h3 className="text-base font-bold text-gray-900 pb-4 border-b border-gray-100">
              Order Summary
            </h3>

            <div className="mt-4 space-y-3 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Total Items</span>
                <span className="font-semibold text-gray-900">
                  {items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Participating Shops</span>
                <span className="font-semibold text-gray-900">{shopEntries.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Local Delivery</span>
                <span className="font-semibold text-emerald-600">Free</span>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-between text-sm">
                <span className="font-bold text-gray-900">Estimated Total</span>
                <span className="font-bold text-emerald-700 text-lg">${subtotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full mt-6 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-200 transition flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
