import React, { useEffect, useState } from 'react';
import type { CustomerAddress } from '../types';
import { fetchAddresses, createAddress, setDefaultAddress, deleteAddress } from '../services/api';

export const AddressSection: React.FC = () => {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    label: 'Home',
    recipientName: '',
    phone: '',
    region: 'Addis Ababa',
    city: 'Addis Ababa',
    subCity: '',
    woreda: '',
    street: '',
    additionalInformation: '',
    isDefault: false,
  });

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const data = await fetchAddresses();
      setAddresses(data);
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleSetDefault = async (addressId?: string) => {
    if (!addressId) return;
    await setDefaultAddress(addressId);
    await loadAddresses();
  };

  const handleDelete = async (addressId?: string) => {
    if (!addressId) return;
    if (confirm('Are you sure you want to remove this delivery address?')) {
      await deleteAddress(addressId);
      await loadAddresses();
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAddress({
      label: formData.label,
      recipientName: formData.recipientName,
      phone: formData.phone,
      region: formData.region,
      city: formData.city,
      subCity: formData.subCity,
      woreda: formData.woreda,
      street: formData.street,
      additionalInformation: formData.additionalInformation,
      isDefault: formData.isDefault,
    });

    setShowAddModal(false);
    setFormData({
      label: 'Home',
      recipientName: '',
      phone: '',
      region: 'Addis Ababa',
      city: 'Addis Ababa',
      subCity: '',
      woreda: '',
      street: '',
      additionalInformation: '',
      isDefault: false,
    });
    await loadAddresses();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📍</span> Delivery Address Book
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage your tailored garment delivery locations with privacy isolation
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold rounded-xl text-xs transition shadow-lg flex items-center gap-1.5"
        >
          <span>+</span> Add New Address
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-slate-400 text-sm">Loading address book...</div>
      ) : addresses.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-sm">
          No saved addresses found. Click "Add New Address" above to save a delivery address.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => {
            const addrId = addr.id || addr._id || addr.addressId;
            return (
              <div
                key={addrId}
                className={`p-4 rounded-xl border transition relative flex flex-col justify-between ${
                  addr.isDefault
                    ? 'bg-slate-800/90 border-amber-500/50 shadow-lg shadow-amber-500/5'
                    : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/70'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-700 text-amber-400 uppercase tracking-wider">
                      {addr.label}
                    </span>
                    {addr.isDefault ? (
                      <span className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-medium">
                        ★ Default Address
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSetDefault(addrId)}
                        className="text-[11px] text-slate-400 hover:text-amber-400 underline"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>

                  <h3 className="font-semibold text-white text-sm">{addr.recipientName}</h3>
                  <p className="text-xs text-slate-300 mt-1">{addr.street}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {addr.subCity ? `${addr.subCity}, ` : ''}{addr.city}, {addr.region}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Phone: {addr.phone}</p>
                  {addr.additionalInformation && (
                    <p className="text-[11px] text-slate-500 italic mt-2">
                      "{addr.additionalInformation}"
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/50 flex justify-end gap-3">
                  <button
                    onClick={() => handleDelete(addrId)}
                    className="text-xs text-red-400 hover:text-red-300 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Address Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Add Delivery Address</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Address Label</label>
                <select
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                >
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Studio">Studio</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Recipient Name *</label>
                <input
                  type="text"
                  required
                  value={formData.recipientName}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  placeholder="Full name for delivery contact"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+251 9..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">SubCity</label>
                  <input
                    type="text"
                    value={formData.subCity}
                    onChange={(e) => setFormData({ ...formData, subCity: e.target.value })}
                    placeholder="e.g. Bole, Kirkos"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Woreda</label>
                  <input
                    type="text"
                    value={formData.woreda}
                    onChange={(e) => setFormData({ ...formData, woreda: e.target.value })}
                    placeholder="e.g. 03"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="Building name, street, apartment number"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Additional Delivery Notes</label>
                <input
                  type="text"
                  value={formData.additionalInformation}
                  onChange={(e) => setFormData({ ...formData, additionalInformation: e.target.value })}
                  placeholder="Landmarks or delivery instructions"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-800 text-amber-400 focus:ring-amber-400"
                />
                <label htmlFor="isDefault" className="text-slate-300">Set as default delivery address</label>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
