import React, { useState, useEffect } from 'react';
import { listPendingShops, listAllShops, approveShop, rejectShop } from '../../services/admin';
import { ShieldCheck, Check, X, Store, User, MapPin, Phone, Mail } from 'lucide-react';

const ApproveShops = () => {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'all'
  const [pendingShops, setPendingShops] = useState([]);
  const [allShops, setAllShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pendingRes, allRes] = await Promise.all([
        listPendingShops(),
        listAllShops(),
      ]);
      setPendingShops(pendingRes.shops || []);
      setAllShops(allRes.shops || []);
    } catch (err) {
      console.error('Error fetching admin shops:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (shopId) => {
    try {
      setActionLoading(shopId);
      await approveShop(shopId);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve shop');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (shopId) => {
    if (!window.confirm('Are you sure you want to reject / suspend this shop?')) return;
    try {
      setActionLoading(shopId);
      await rejectShop(shopId);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject shop');
    } finally {
      setActionLoading(null);
    }
  };

  const displayedShops = activeTab === 'pending' ? pendingShops : allShops;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-600" />
            Shop Approvals & Management
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Review vendor registrations before they appear on the public marketplace.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'pending'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending ({pendingShops.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Registered ({allShops.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
        </div>
      ) : displayedShops.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center shadow-sm max-w-md mx-auto">
          <Store className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900">
            {activeTab === 'pending' ? 'No Pending Approvals' : 'No Shops Registered'}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {activeTab === 'pending' ? 'All submitted seller shops have been verified and processed.' : 'No vendors have registered a shop yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedShops.map((shop) => (
            <div key={shop._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between">
              <div className="p-6">
                {/* Shop logo & name */}
                <div className="flex items-start gap-3">
                  {shop.shopLogo ? (
                    <img src={shop.shopLogo} alt={shop.shopName} className="w-12 h-12 rounded-xl object-cover border border-gray-100 bg-gray-50" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Store className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 truncate">{shop.shopName}</h3>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                      shop.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {shop.isApproved ? 'Approved' : 'Pending Verification'}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-600 mt-3 line-clamp-2">
                  {shop.description || 'No description provided.'}
                </p>

                {/* Seller info */}
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
                  <p className="flex items-center gap-1.5 font-medium text-gray-800">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    Seller: {shop.sellerId?.name || 'Unknown'}
                  </p>
                  {shop.sellerId?.email && (
                    <p className="flex items-center gap-1.5 text-gray-500">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      {shop.sellerId?.email}
                    </p>
                  )}
                  {shop.address && (
                    <p className="flex items-center gap-1.5 text-gray-500">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {shop.address}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-gray-50 p-4 border-t border-gray-100 flex items-center gap-2">
                {!shop.isApproved ? (
                  <>
                    <button
                      onClick={() => handleApprove(shop._id)}
                      disabled={actionLoading === shop._id}
                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      Approve Shop
                    </button>
                    <button
                      onClick={() => handleReject(shop._id)}
                      disabled={actionLoading === shop._id}
                      className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleReject(shop._id)}
                    disabled={actionLoading === shop._id}
                    className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs rounded-xl transition"
                  >
                    Suspend Shop Approval
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApproveShops;
