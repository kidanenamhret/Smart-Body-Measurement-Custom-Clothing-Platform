import React, { useState } from 'react';
import type { DeliveryJob } from '../types';
import { saveDeliveryJobStatus } from '../services/api';

interface DeliverySectionProps {
  jobs: DeliveryJob[];
}

export const DeliverySection: React.FC<DeliverySectionProps> = ({ jobs: initialJobs }) => {
  const [jobs, setJobs] = useState<DeliveryJob[]>(initialJobs);

  const handleUpdateStatus = (jobId: string, newStatus: string) => {
    // Persist immediately so navigation doesn't lose this change
    saveDeliveryJobStatus(jobId, newStatus);
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
    );
  };

  return (
    <section style={{ padding: '40px 0' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Delivery Agent Dispatch & Fleet Operations</h2>
        <p style={{ color: '#94a3b8' }}>
          View open pickup jobs from tailor workshops and manage active garment deliveries.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
        {jobs.map((job) => (
          <div key={job.id} className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#f8fafc' }}>Job #{job.id}</span>
              <span className={`badge ${job.status === 'DELIVERED' ? 'badge-emerald' : job.status === 'AVAILABLE' ? 'badge-gold' : 'badge-cyan'}`}>
                {job.status.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Pickup Info */}
            <div style={{ padding: '12px 16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', marginBottom: '12px', borderLeft: '4px solid #f59e0b' }}>
              <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                🏬 Pickup (Tailor Workshop)
              </span>
              <div style={{ fontSize: '0.9rem', color: '#f8fafc', fontWeight: '600' }}>{job.pickupInfo.businessName}</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{job.pickupInfo.address}</div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '4px' }}>📞 {job.pickupInfo.contactPhone}</div>
            </div>

            {/* Delivery Info */}
            <div style={{ padding: '12px 16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #06b6d4' }}>
              <span style={{ fontSize: '0.75rem', color: '#06b6d4', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                📍 Delivery Destination
              </span>
              <div style={{ fontSize: '0.9rem', color: '#f8fafc', fontWeight: '600' }}>{job.deliveryInfo.recipientName}</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{job.deliveryInfo.address}</div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '4px' }}>📞 {job.deliveryInfo.contactPhone}</div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {job.status === 'AVAILABLE' ? (
                <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => handleUpdateStatus(job.id, 'ACCEPTED')}>
                  Claim Job 🛵
                </button>
              ) : job.status === 'ACCEPTED' ? (
                <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => handleUpdateStatus(job.id, 'PICKED_UP')}>
                  Confirm Pickup at Workshop 📦
                </button>
              ) : job.status === 'EN_ROUTE_TO_CUSTOMER' || job.status === 'PICKED_UP' ? (
                <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', background: '#10b981' }} onClick={() => handleUpdateStatus(job.id, 'DELIVERED')}>
                  Confirm Handover to Customer ✅
                </button>
              ) : (
                <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: '600', textAlign: 'center', width: '100%' }}>
                  Delivery Completed & Signed
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
