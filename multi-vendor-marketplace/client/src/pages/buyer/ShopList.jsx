import React, { useState, useEffect } from 'react';
import { listApprovedShops } from '../../services/shop';
import ShopCard from '../../components/ShopCard';
import { Search, Store, Sparkles } from 'lucide-react';

const ShopList = () => {
  const [shops, setShops] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchShops = async (query = '') => {
    try {
      setLoading(true);
      const data = await listApprovedShops(query);
      if (data && data.shops) {
        setShops(data.shops);
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchShops(search);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero section */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl mb-10 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-emerald-200 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Support Local Businesses
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Discover Verified Local Vendors In Your Neighborhood
          </h1>
          <p className="mt-4 text-sm sm:text-base text-emerald-100/90 leading-relaxed">
            Shop directly from curated neighborhood businesses, independent boutiques, and local artisans in one place.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mt-8 flex gap-2 max-w-md bg-white rounded-2xl p-1.5 shadow-lg">
            <div className="flex-1 flex items-center pl-3">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search shops or locations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-2 pr-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
            >
              Search
            </button>
          </form>
        </div>

        {/* Decorative background element */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
          <Store className="w-96 h-96 text-white" />
        </div>
      </div>

      {/* Shop Listings */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Featured Local Shops</h2>
            <p className="text-xs text-gray-500 mt-0.5">Explore verified sellers ready to fulfill your order</p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {shops.length} Active Stores
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
          </div>
        ) : shops.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-md mx-auto my-8 shadow-sm">
            <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-800">No Approved Shops Found</h3>
            <p className="text-xs text-gray-500 mt-1">
              {search ? `No shops matched your search "${search}".` : 'Check back later as new vendors are approved by admin.'}
            </p>
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  fetchShops('');
                }}
                className="mt-4 text-xs font-semibold text-emerald-600 hover:underline"
              >
                Clear search filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {shops.map((shop) => (
              <ShopCard key={shop._id} shop={shop} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopList;
