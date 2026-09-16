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
    <div className="glass-card" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <span>📍</span> Delivery Address Book
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Manage your tailored garment delivery locations with privacy isolation
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <span>+</span> Add New Address
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading address book...</div>
      ) : addresses.length === 0 ? (
        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No saved addresses found. Click "Add New Address" above to save a delivery address.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {addresses.map((addr) => {
            const addrId = addr.id || addr._id || addr.addressId;
            return (
              <div
                key={addrId}
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  border: addr.isDefault ? '1px solid var(--primary-gold)' : '1px solid var(--border-color)',
                  background: addr.isDefault ? 'rgba(245, 158, 11, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <span className="badge badge-cyan">
                      {addr.label}
                    </span>
                    {addr.isDefault ? (
                      <span className="badge badge-gold" style={{ fontSize: '10px' }}>
                        ★ Default Address
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSetDefault(addrId)}
                        style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Set as Default
                      </button>
                    )}
                  </div>

                  <h3 style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '1rem', margin: '0 0 4px 0' }}>{addr.recipientName}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', margin: '0 0 2px 0' }}>{addr.street}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 2px 0' }}>
                    {addr.subCity ? `${addr.subCity}, ` : ''}{addr.city}, {addr.region}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 8px 0' }}>Phone: {addr.phone}</p>
                  {addr.additionalInformation && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic', margin: 0 }}>
                      "{addr.additionalInformation}"
                    </p>
                  )}
                </div>

                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => handleDelete(addrId)}
                    style={{ fontSize: '0.8rem', color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer' }}
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '32px', background: 'var(--bg-surface)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Add Delivery Address</h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.9rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '6px' }}>Address Label</label>
                <select
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', color: 'var(--text-main)' }}
                >
                  <option style={{ color: '#000' }} value="Home">Home</option>
                  <option style={{ color: '#000' }} value="Office">Office</option>
                  <option style={{ color: '#000' }} value="Studio">Studio</option>
                  <option style={{ color: '#000' }} value="Other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '6px' }}>Recipient Name *</label>
                <input
                  type="text"
                  required
                  value={formData.recipientName}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  placeholder="Full name for delivery contact"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', color: 'var(--text-main)', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '6px' }}>Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+251 9..."
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', color: 'var(--text-main)', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '6px' }}>City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', color: 'var(--text-main)', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '6px' }}>SubCity</label>
                  <input
                    type="text"
                    value={formData.subCity}
                    onChange={(e) => setFormData({ ...formData, subCity: e.target.value })}
                    placeholder="e.g. Bole, Kirkos"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', color: 'var(--text-main)', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '6px' }}>Woreda</label>
                  <input
                    type="text"
                    value={formData.woreda}
                    onChange={(e) => setFormData({ ...formData, woreda: e.target.value })}
                    placeholder="e.g. 03"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', color: 'var(--text-main)', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '6px' }}>Street Address *</label>
                <input
                  type="text"
                  required
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="Building name, street, apartment number"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', color: 'var(--text-main)', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '6px' }}>Additional Delivery Notes</label>
                <input
                  type="text"
                  value={formData.additionalInformation}
                  onChange={(e) => setFormData({ ...formData, additionalInformation: e.target.value })}
                  placeholder="Landmarks or delivery instructions"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', color: 'var(--text-main)', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="isDefault" style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>Set as default delivery address</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: '0.9rem' }}
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
