import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addProduct } from '../../services/product';
import { getCategories } from '../../services/admin';
import { getMyShop } from '../../services/shop';
import { PlusCircle, ArrowLeft, Upload, Package } from 'lucide-react';

const AddProduct = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [categoriesList, setCategoriesList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if seller has a shop
    getMyShop().then((res) => {
      if (!res.shop) {
        alert('Please create your shop profile first before adding products.');
        navigate('/seller/settings');
      }
    });

    // Fetch existing categories
    getCategories().then((res) => {
      if (res && res.categories) {
        setCategoriesList(res.categories);
      }
    });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !price) {
      setError('Product name and price are required');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('name', name);
      formData.append('brand', brand);
      formData.append('category', category);
      formData.append('price', price);
      formData.append('stock', stock);
      formData.append('description', description);

      if (imageFile) {
        formData.append('images', imageFile);
      } else if (imageUrl) {
        formData.append('images', imageUrl);
      }

      await addProduct(formData);
      navigate('/seller/products');
    } catch (err) {
      console.error('Error adding product:', err);
      setError(err.response?.data?.message || 'Failed to add product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <button
        onClick={() => navigate('/seller/products')}
        className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-emerald-600 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Add New Product
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            This item will automatically be tied to your seller shop.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-5">
        {/* Name */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Product Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Organic Raw Honey 500g"
            className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Brand & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Brand / Producer
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Local Apiary"
              className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Category
            </label>
            <input
              list="categories-options"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Select or enter category"
              className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <datalist id="categories-options">
              {categoriesList.map((cat) => (
                <option key={cat._id} value={cat.name} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Price & Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Price ($ USD) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="12.99"
              className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Initial Stock (Units)
            </label>
            <input
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="10"
              className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Image */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Product Image
          </label>
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
            />
            <input
              type="text"
              placeholder="Or paste an image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Product details, ingredients, specifications, freshness info..."
            className="w-full p-3 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition"
        >
          {submitting ? 'Creating Product...' : 'Publish Product to Shop'}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
