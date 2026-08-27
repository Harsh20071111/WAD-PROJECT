import React from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';

const CartItem = ({ item, onUpdateQty, onRemove }) => {
  const product = item.productId || {};
  const currentQty = item.quantity || 1;
  const imageSrc = product.images && product.images.length > 0
    ? product.images[0]
    : 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80';

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-b-0">
      {/* Product Image */}
      <img
        src={imageSrc}
        alt={product.name || 'Product'}
        className="w-16 h-16 rounded-xl object-cover bg-gray-100 flex-shrink-0"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80';
        }}
      />

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-900 truncate">
          {product.name || 'Unavailable product'}
        </h4>
        <p className="text-xs text-gray-500 mt-0.5">
          ${Number(product.price || 0).toFixed(2)} each
        </p>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1 bg-gray-50">
        <button
          onClick={() => onUpdateQty(item._id, currentQty - 1)}
          className="w-6 h-6 flex items-center justify-center rounded text-gray-600 hover:bg-white transition"
          title="Decrease quantity"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="w-6 text-center text-xs font-bold text-gray-800">
          {currentQty}
        </span>
        <button
          onClick={() => onUpdateQty(item._id, currentQty + 1)}
          disabled={product.stock !== undefined && currentQty >= product.stock}
          className="w-6 h-6 flex items-center justify-center rounded text-gray-600 hover:bg-white disabled:opacity-40 transition"
          title="Increase quantity"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Total for this line */}
      <div className="text-right min-w-[70px]">
        <p className="text-sm font-bold text-gray-900">
          ${Number((product.price || 0) * currentQty).toFixed(2)}
        </p>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(item._id)}
        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
        title="Remove item"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default CartItem;
