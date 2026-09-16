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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔔</span>
              <h2 className="text-lg font-bold text-white">Notifications</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
                {notifications.filter((n) => !n.isRead).length} new
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              ✕
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                Fetching notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                No notifications right now.
              </div>
            ) : (
              notifications.map((item) => {
                const notifId = item.id || item._id || item.notificationId;
                return (
                  <div
                    key={notifId}
                    className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                      item.isRead
                        ? 'bg-slate-950/40 border-slate-800/60 opacity-75'
                        : 'bg-slate-800/80 border-amber-500/40 shadow-md ring-1 ring-amber-500/20'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-800 text-slate-300">
                          {item.channel} • {item.eventType.replace(/_/g, ' ')}
                        </span>
                        {!item.isRead && (
                          <button
                            onClick={() => handleMarkRead(notifId)}
                            className="text-[11px] text-amber-400 hover:underline"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                      <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.body}</p>
                    </div>
                    <div className="mt-3 text-[10px] text-slate-500 text-right">
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
