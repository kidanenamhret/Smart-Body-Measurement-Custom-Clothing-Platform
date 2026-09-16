import React, { useEffect, useState } from 'react';
import type { AdminMetrics, AuditLogItem, Tailor, SupportTicketItem } from '../types';
import { fetchAuditLogs, fetchTailors, fetchSupportTickets, updateTailorStatus } from '../services/api';
import { SkeletonLoader, LoadingButton } from './UIComponents';

interface AdminSectionProps {
  metrics: AdminMetrics;
  onRefreshMetrics?: () => void;
}

export const AdminSection: React.FC<AdminSectionProps> = ({ metrics, onRefreshMetrics }) => {
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [tailorsList, setTailorsList] = useState<Tailor[]>([]);
  const [ticketsList, setTicketsList] = useState<SupportTicketItem[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(true);
  const [loadingTailors, setLoadingTailors] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadAdminData() {
      setLoadingAudit(true);
      setLoadingTailors(true);
      setLoadingTickets(true);
      try {
        const [logs, tailors, tickets] = await Promise.all([
          fetchAuditLogs(),
          fetchTailors(),
          fetchSupportTickets(),
        ]);
        setAuditLogs(logs);
        setTailorsList(tailors);
        setTicketsList(tickets);
      } catch (err) {
        console.error('Failed to load admin panel data:', err);
      } finally {
        setLoadingAudit(false);
        setLoadingTailors(false);
        setLoadingTickets(false);
      }
    }
    loadAdminData();
  }, []);

  const handleVerifyTailor = async (tailorId: string | number, status: 'VERIFIED' | 'REJECTED') => {
    const idStr = String(tailorId);
    setActionLoadingId(idStr);
    try {
      await updateTailorStatus(idStr, status, status === 'VERIFIED' ? 'Approved by Admin' : 'Rejected document verification');
      setTailorsList((prev) =>
        prev.map((t) => (String(t.id) === idStr ? { ...t, verificationStatus: status } : t))
      );
      if (onRefreshMetrics) onRefreshMetrics();
    } catch (err: any) {
      alert(`Error updating tailor status: ${err.message || err}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Compute metric display values strictly from real database props
  const customerCount = metrics.customers ?? metrics.totalCustomers ?? 0;
  const tailorCount = metrics.tailors ?? metrics.totalTailors ?? 0;
  const verifiedTailorCount = metrics.verifiedTailors ?? (metrics as any).verifiedTailors ?? 0;
  const pendingVerificationCount = metrics.pendingVerifications ?? metrics.pendingTailorVerifications ?? 0;
  const totalOrdersCount = metrics.orders ?? (metrics as any).orders ?? 0;
  const activeOrdersCount = metrics.activeOrders ?? 0;
  const completedOrdersCount = metrics.completedOrders ?? (metrics as any).completedOrdersCount ?? 0;
  const cancelledOrdersCount = metrics.cancelledOrders ?? 0;

  const paymentVolume = metrics.payments?.totalVolume ?? metrics.totalPlatformRevenue ?? 0;
  const paymentTxCount = metrics.payments?.totalTransactions ?? 0;

  const totalDeliveries = metrics.deliveries?.total ?? 0;
  const activeDeliveries = metrics.deliveries?.active ?? 0;

  const totalTickets = metrics.supportTickets?.total ?? 0;
  const openTickets = metrics.supportTickets?.open ?? metrics.openSupportTickets ?? 0;

  return (
    <section style={{ padding: '32px 0' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#f8fafc', marginBottom: '4px' }}>
            🛡️ Platform Governance & Real DB Admin Dashboard
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
            Live metrics aggregated directly from production database collections. Zero hardcoded stats.
          </p>
        </div>

        {onRefreshMetrics && (
          <button
            className="btn-secondary"
            onClick={onRefreshMetrics}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '0.85rem' }}
          >
            🔄 Sync Real DB Data
          </button>
        )}
      </div>

      {/* 11 REAL DATABASE METRICS GRID (Requirement 41) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {/* Customers */}
        <div className="glass-card" style={{ padding: '18px' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
            👥 Registered Customers
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#f8fafc' }}>
            {customerCount.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '2px', display: 'block' }}>Real DB User Accounts</span>
        </div>

        {/* Tailors */}
        <div className="glass-card" style={{ padding: '18px' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
            ✂️ Total Tailors
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#f59e0b' }}>
            {tailorCount.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#fbbf24', marginTop: '2px', display: 'block' }}>Registered Workshop Tailors</span>
        </div>

        {/* Verified Tailors */}
        <div className="glass-card" style={{ padding: '18px' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
            ✅ Verified Tailors
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#10b981' }}>
            {verifiedTailorCount.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '2px', display: 'block' }}>License Approved</span>
        </div>

        {/* Pending Verifications */}
        <div className="glass-card" style={{ padding: '18px' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
            ⏳ Pending Verifications
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fbbf24' }}>
            {pendingVerificationCount.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '2px', display: 'block' }}>Awaiting License Review</span>
        </div>

        {/* Total Orders */}
        <div className="glass-card" style={{ padding: '18px' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
            📦 Total Platform Orders
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#06b6d4' }}>
            {totalOrdersCount.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '2px', display: 'block' }}>DB Order Documents</span>
        </div>

        {/* Active Orders */}
        <div className="glass-card" style={{ padding: '18px' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
            ⚡ Active Sewing Orders
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#38bdf8' }}>
            {activeOrdersCount.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '2px', display: 'block' }}>In Active Production</span>
        </div>

        {/* Completed Orders */}
        <div className="glass-card" style={{ padding: '18px' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
            🏁 Completed Orders
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#34d399' }}>
            {completedOrdersCount.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '2px', display: 'block' }}>Delivered Garments</span>
        </div>

        {/* Cancelled Orders */}
        <div className="glass-card" style={{ padding: '18px' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
            ❌ Cancelled Orders
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#f87171' }}>
            {cancelledOrdersCount.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '2px', display: 'block' }}>Cancelled or Rejected</span>
        </div>

        {/* Real Revenue & Payments */}
        <div className="glass-card" style={{ padding: '18px' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
            💳 Gross Payment Volume
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#10b981' }}>
            {paymentVolume.toLocaleString()} <span style={{ fontSize: '0.85rem' }}>ETB</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '2px', display: 'block' }}>{paymentTxCount} Payment Logs</span>
        </div>

        {/* Deliveries */}
        <div className="glass-card" style={{ padding: '18px' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
            🚚 Delivery Jobs
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#a855f7' }}>
            {totalDeliveries.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#c084fc', marginTop: '2px', display: 'block' }}>{activeDeliveries} In Transit</span>
        </div>

        {/* Support Tickets */}
        <div className="glass-card" style={{ padding: '18px' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
            🎫 Support Tickets
          </span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#f59e0b' }}>
            {totalTickets.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#fbbf24', marginTop: '2px', display: 'block' }}>{openTickets} Open Complaints</span>
        </div>
      </div>

      {/* PANELS GRID: TAILOR VERIFICATIONS & AUDIT LOGS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* TAILOR VERIFICATION MANAGEMENT PANEL */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#f59e0b', marginBottom: '16px' }}>
            📋 Tailor License Verification Governance
          </h3>

          {loadingTailors ? (
            <SkeletonLoader count={3} height="60px" />
          ) : tailorsList.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: '0.85rem', padding: '16px 0' }}>No tailors registered in database.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {tailorsList.map((t) => {
                const isPending = (t.verificationStatus || 'PENDING') === 'PENDING';
                const isVerified = t.verificationStatus === 'VERIFIED';

                return (
                  <div
                    key={String(t.id)}
                    style={{
                      padding: '14px',
                      background: 'rgba(15, 23, 42, 0.7)',
                      borderRadius: '10px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.925rem', color: '#f8fafc' }}>{t.businessName}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                        Status:{' '}
                        <span style={{ color: isVerified ? '#34d399' : isPending ? '#fbbf24' : '#f87171', fontWeight: '700' }}>
                          {t.verificationStatus || 'PENDING'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {isPending && (
                        <>
                          <LoadingButton
                            isLoading={actionLoadingId === String(t.id)}
                            onClick={() => handleVerifyTailor(t.id, 'VERIFIED')}
                            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                          >
                            Approve
                          </LoadingButton>
                          <button
                            className="btn-secondary"
                            onClick={() => handleVerifyTailor(t.id, 'REJECTED')}
                            disabled={actionLoadingId === String(t.id)}
                            style={{ padding: '6px 12px', fontSize: '0.75rem', color: '#f87171' }}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {isVerified && (
                        <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: '700' }}>✓ Approved</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* PRIVACY-SAFE AUDIT LOGS PANEL */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#06b6d4', margin: 0 }}>
              🛡️ Privacy-Safe Security Audit Logs
            </h3>
            <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid #10b981', borderRadius: '4px' }}>
              Credentials Sanitized
            </span>
          </div>

          {loadingAudit ? (
            <SkeletonLoader count={4} height="50px" />
          ) : auditLogs.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>
              No audit records logged.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
              {auditLogs.map((log, idx) => (
                <div
                  key={log.id || log._id || idx}
                  style={{
                    padding: '12px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ color: '#f59e0b', fontWeight: '700' }}>⚡ {log.action}</span>
                    <span style={{ color: '#64748b', fontSize: '0.7rem' }}>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <div style={{ color: '#cbd5e1', marginBottom: '4px' }}>
                    👤 Actor: <strong>{log.actor?.name || log.actor?.userId || 'System'}</strong> ({log.actor?.role || 'SYSTEM'}) • Resource: <span style={{ color: '#06b6d4' }}>{log.resource}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SUPPORT TICKETS & COMPLAINTS PANEL */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#f59e0b', marginBottom: '16px' }}>
            🎫 Open Customer Complaints & Tickets ({ticketsList.length})
          </h3>

          {loadingTickets ? (
            <SkeletonLoader count={3} height="60px" />
          ) : ticketsList.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>
              No active support tickets found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {ticketsList.map((t) => (
                <div
                  key={t.id || t._id || t.ticketNumber}
                  style={{
                    padding: '12px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700', color: '#f59e0b', fontSize: '0.85rem' }}>#{t.ticketNumber}</span>
                    <span style={{ fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(6,182,212,0.15)', color: '#38bdf8' }}>
                      {t.status}
                    </span>
                  </div>
                  <div style={{ fontWeight: '600', color: '#f8fafc', fontSize: '0.875rem', marginTop: '4px' }}>{t.subject}</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>{t.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
