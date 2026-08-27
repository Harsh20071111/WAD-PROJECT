import React, { useState, useEffect } from 'react';
import { getMyShop, createShop, updateShop } from '../../services/shop';
import { Store, Upload, CheckCircle2, AlertCircle } from 'lucide-react';

const ShopSettings = () => {
  const [shop, setShop] = useState(null);
  const [shopName, setShopName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [shopLogo, setShopLogo] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchShop = async () => {
      try {
        setLoading(true);
        const data = await getMyShop();
        if (data && data.shop) {
          setShop(data.shop);
          setShopName(data.shop.shopName || '');
          setDescription(data.shop.description || '');
          setAddress(data.shop.address || '');
          setShopLogo(data.shop.shopLogo || '');
        }
      } catch (err) {
        console.error('Error fetching shop details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!shopName.trim()) {
      setError('Shop name is required');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('shopName', shopName);
      formData.append('description', description);
      formData.append('address', address);

      if (logoFile) {
        formData.append('image', logoFile);
      } else if (shopLogo) {
        formData.append('shopLogo', shopLogo);
      }

      let res;
      if (shop) {
        res = await updateShop(formData);
        setMessage('Shop profile updated successfully!');
      } else {
        res = await createShop(formData);
        setMessage('Shop created successfully! It is now pending admin approval.');
      }

      if (res && res.shop) {
        setShop(res.shop);
      }
    } catch (err) {
      console.error('Error saving shop:', err);
      setError(err.response?.data?.message || 'Failed to save shop profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            {shop ? 'Shop Settings & Profile' : 'Register Your Shop'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage your store information, branding, and local business address.
          </p>
        </div>

        {shop && (
          <div>
            {shop.isApproved ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Approved & Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                <AlertCircle className="w-3.5 h-3.5" />
                Pending Approval
              </span>
            )}
          </div>
        )}
      </div>

      {message && (
        <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Shop Name */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Shop Name *
          </label>
          <input
            type="text"
            required
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            placeholder="e.g. Green Valley Organic Grocers"
            className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Shop Logo & Preview */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Shop Logo / Banner
          </label>
          <div className="flex items-center gap-4">
            {shopLogo || logoFile ? (
              <img
                src={logoFile ? URL.createObjectURL(logoFile) : shopLogo}
                alt="Shop Logo"
                className="w-16 h-16 rounded-xl object-cover border border-gray-200 bg-gray-50"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center">
                <Store className="w-8 h-8" />
              </div>
            )}

            <div className="flex-1 space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files[0])}
                className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
              <input
                type="text"
                placeholder="Or paste an image URL directly"
                value={shopLogo}
                onChange={(e) => setShopLogo(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Local Store Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. 124 Main Street, Downtown"
            className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Store Description & Story
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell your local customers about what you sell, opening hours, or what makes your store unique..."
            className="w-full p-3 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition"
        >
          {submitting ? 'Saving Shop...' : shop ? 'Save Changes' : 'Create Shop'}
        </button>
      </form>
    </div>
  );
};

export default ShopSettings;
