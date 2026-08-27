import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyProducts, updateProduct, deleteProduct } from '../../services/product';
import { PlusCircle, Edit3, Trash2, Package, Tag, Check, X } from 'lucide-react';

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', price: '', stock: '', description: '' });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getMyProducts();
      if (data && data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Error fetching my products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const startEdit = (product) => {
    setEditingProduct(product._id);
    setEditForm({
      name: product.name,
      price: product.price,
      stock: product.stock,
      description: product.description || '',
    });
  };

  const saveEdit = async (id) => {
    try {
      const res = await updateProduct(id, editForm);
      if (res && res.product) {
        setProducts(products.map((p) => (p._id === id ? res.product : p)));
      }
      setEditingProduct(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update product');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            My Product Inventory
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage product listings, pricing, and stock levels exclusively for your store.
          </p>
        </div>

        <Link
          to="/seller/add-product"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center shadow-sm max-w-md mx-auto">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900">No Products in Your Shop</h3>
          <p className="text-xs text-gray-500 mt-1">Add your first product to start selling to local customers.</p>
          <Link
            to="/seller/add-product"
            className="inline-flex items-center gap-1.5 mt-5 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition"
          >
            <PlusCircle className="w-4 h-4" />
            Add First Product
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Product</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Price</th>
                  <th className="px-6 py-3.5">Stock</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => {
                  const isEditing = editingProduct === p._id;
                  const imageSrc = p.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=100&q=80';

                  return (
                    <tr key={p._id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={imageSrc}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover bg-gray-100 flex-shrink-0"
                          />
                          <div>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                className="p-1 border border-gray-300 rounded text-xs w-full"
                              />
                            ) : (
                              <>
                                <p className="font-bold text-gray-900">{p.name}</p>
                                {p.brand && <p className="text-[10px] text-gray-400 uppercase font-semibold">{p.brand}</p>}
                              </>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px] font-medium">
                          <Tag className="w-3 h-3 text-gray-400" />
                          {p.category || 'General'}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editForm.price}
                            onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                            className="p-1 border border-gray-300 rounded text-xs w-20"
                          />
                        ) : (
                          <span className="font-bold text-gray-900">${Number(p.price).toFixed(2)}</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editForm.stock}
                            onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                            className="p-1 border border-gray-300 rounded text-xs w-16"
                          />
                        ) : (
                          <span className={`font-semibold ${p.stock > 0 ? 'text-gray-700' : 'text-red-600'}`}>
                            {p.stock} units
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => saveEdit(p._id)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                              title="Save"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingProduct(null)}
                              className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => startEdit(p)}
                              className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                              title="Quick Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(p._id)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProducts;
