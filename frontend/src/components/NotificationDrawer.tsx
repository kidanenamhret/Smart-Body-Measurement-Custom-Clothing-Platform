import React, { useEffect, useState } from 'react';
import type { NotificationItem } from '../types';
import { fetchNotifications, markNotificationRead } from '../services/api';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateCount?: (count: number) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onUpdateCount,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await fetchNotifications();
      setNotifications(data);
      const unread = data.filter((n) => !n.isRead).length;
      if (onUpdateCount) onUpdateCount(unread);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const handleMarkRead = async (id?: string) => {
    if (!id) return;
    await markNotificationRead(id);
    const updated = notifications.map((n) =>
      (n.id === id || n._id === id || n.notificationId === id) ? { ...n, isRead: true } : n
    );
    setNotifications(updated);
    const unread = updated.filter((n) => !n.isRead).length;
    if (onUpdateCount) onUpdateCount(unread);
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, overflow: 'hidden', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'flex-end' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px', height: '100%', borderRadius: 0, display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--border-color)', borderTop: 'none', borderRight: 'none', borderBottom: 'none' }}>
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.25rem' }}>🔔</span>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>Notifications</h2>
            <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>
              {notifications.filter((n) => !n.isRead).length} new
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ padding: '4px 8px', borderRadius: '8px', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
          >
            ✕
          </button>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {loading ? (
            <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Fetching notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.875rem' }}>
              No notifications right now.
            </div>
          ) : (
            notifications.map((item) => {
              const notifId = item.id || item._id || item.notificationId || Math.random().toString();
              const eventTypeStr = item.eventType || 'SYSTEM_UPDATE';
              const channelStr = item.channel || 'in-app';
              
              return (
                <div
                  key={notifId}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: item.isRead ? '1px solid rgba(255,255,255,0.05)' : '1px solid var(--primary-gold)',
                    background: item.isRead ? 'rgba(255,255,255,0.02)' : 'rgba(245, 158, 11, 0.05)',
                    opacity: item.isRead ? 0.75 : 1
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                        {channelStr} • {eventTypeStr.replace(/_/g, ' ')}
                      </span>
                      {!item.isRead && (
                        <button
                          onClick={() => handleMarkRead(notifId)}
                          style={{ fontSize: '0.7rem', color: 'var(--primary-gold)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)', margin: '0 0 4px 0' }}>{item.title || 'Notification'}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>{item.body || ''}</p>
                  </div>
                  <div style={{ marginTop: '12px', fontSize: '0.65rem', color: 'var(--text-dim)', textAlign: 'right' }}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Just now'}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
