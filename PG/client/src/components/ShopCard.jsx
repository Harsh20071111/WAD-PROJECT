import React from 'react';
import { Link } from 'react-router-dom';
import { Store, MapPin, ArrowRight } from 'lucide-react';

const ShopCard = ({ shop }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between group">
      <div>
        {/* Banner/Header */}
        <div className="h-32 bg-gradient-to-r from-emerald-600 to-teal-700 relative p-4 flex items-end">
          <div className="absolute -bottom-6 left-5">
            {shop.shopLogo ? (
              <img
                src={shop.shopLogo}
                alt={shop.shopName}
                className="w-16 h-16 rounded-xl border-4 border-white object-cover bg-white shadow-sm"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/150?text=Shop';
                }}
              />
            ) : (
              <div className="w-16 h-16 rounded-xl border-4 border-white bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-sm">
                <Store className="w-8 h-8" />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="pt-8 p-5">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition">
            {shop.shopName}
          </h3>

          {shop.address && (
            <p className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="truncate">{shop.address}</span>
            </p>
          )}

          <p className="text-xs text-gray-600 mt-3 line-clamp-2 leading-relaxed">
            {shop.description || 'Welcome to our local store! Browse our freshly stocked products.'}
          </p>
        </div>
      </div>

      <div className="p-5 pt-0">
        <Link
          to={`/shops/${shop._id}`}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition duration-150 shadow-sm"
        >
          <span>Visit Store</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default ShopCard;
