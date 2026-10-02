import React, { useState } from 'react';
import { ShoppingCart, Check, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const { isAuthenticated, user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'buyer') {
      alert('Only buyers can add items to cart. Please log in with a buyer account.');
      return;
    }

    try {
      setAdding(true);
      await addItem(product._id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add item to cart');
    } finally {
      setAdding(false);
    }
  };

  const imageSrc = product.images && product.images.length > 0 
    ? product.images[0] 
    : 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80';

  const inStock = product.stock > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between group">
      <div>
        {/* Product Image */}
        <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
          <img
            src={imageSrc}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80';
            }}
          />
          {product.category && (
            <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full text-gray-700 shadow-sm flex items-center gap-1">
              <Tag className="w-3 h-3 text-emerald-600" />
              {product.category}
            </span>
          )}
          {!inStock && (
            <span className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center text-white font-bold text-sm tracking-wide">
              OUT OF STOCK
            </span>
          )}
        </div>

        {/* Product Details */}
        <div className="p-4">
          {product.brand && (
            <p className="text-xs uppercase font-bold text-emerald-600 tracking-wider mb-1">
              {product.brand}
            </p>
          )}
          <h4 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-emerald-600 transition">
            {product.name}
          </h4>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
            {product.description || 'Quality local product directly sourced and guaranteed fresh.'}
          </p>
        </div>
      </div>

      {/* Footer Price & Add to Cart */}
      <div className="p-4 pt-0">
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <span className="text-xs text-gray-400 block">Price</span>
            <span className="text-lg font-bold text-gray-900">${Number(product.price).toFixed(2)}</span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!inStock || adding}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm ${
              !inStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : added
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>{adding ? 'Adding...' : 'Add'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
