import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getShopById } from '../../services/shop';
import { getShopProducts } from '../../services/product';
import ProductCard from '../../components/ProductCard';
import { Store, MapPin, Package, ArrowLeft, Tag } from 'lucide-react';

const ShopPage = () => {
  const { shopId } = useParams();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShopAndProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch shop metadata
        const shopRes = await getShopById(shopId);
        setShop(shopRes.shop);

        // 2. Fetch products strictly for this shop (Isolation boundary)
        const prodRes = await getShopProducts(shopId, { category: selectedCategory });
        setProducts(prodRes.products || []);
      } catch (err) {
        console.error('Error fetching shop page:', err);
        setError(err.response?.data?.message || 'Shop not found or not approved');
      } finally {
        setLoading(false);
      }
    };

    fetchShopAndProducts();
  }, [shopId, selectedCategory]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-gray-200 rounded-2xl text-center shadow-sm">
        <Store className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-900">Shop Unavailable</h2>
        <p className="text-xs text-gray-500 mt-1">{error || 'This shop does not exist or is awaiting approval.'}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 mt-6 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all shops
        </Link>
      </div>
    );
  }

  // Extract unique categories from current shop products for filter pills
  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-emerald-600 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        All Shops
      </Link>

      {/* Shop Header Banner */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        <div className="h-40 sm:h-48 bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 relative">
          <div className="absolute -bottom-10 left-6 sm:left-8 flex items-end gap-4">
            {shop.shopLogo ? (
              <img
                src={shop.shopLogo}
                alt={shop.shopName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-white object-cover bg-white shadow-md"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-white bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-md">
                <Store className="w-10 h-10" />
              </div>
            )}
          </div>
        </div>

        <div className="pt-12 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {shop.shopName}
              </h1>
              {shop.address && (
                <p className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {shop.address}
                </p>
              )}
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              <Package className="w-4 h-4" />
              {products.length} Products Available
            </div>
          </div>

          {shop.description && (
            <p className="text-sm text-gray-600 mt-4 max-w-3xl leading-relaxed">
              {shop.description}
            </p>
          )}
        </div>
      </div>

      {/* Category Filters */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition flex-shrink-0 ${
              selectedCategory === ''
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition flex-shrink-0 flex items-center gap-1 ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Tag className="w-3 h-3" />
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Product Grid strictly from this shop */}
      <div>
        {products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center my-6">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-800">No Products Listed Yet</h3>
            <p className="text-xs text-gray-500 mt-1">This shop currently has no active products in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
