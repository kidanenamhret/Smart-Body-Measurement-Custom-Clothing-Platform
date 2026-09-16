import React, { useEffect, useState } from 'react';
import type { SupportTicketItem, UserRole, TicketStatus, TicketPriority } from '../types';
import { fetchSupportTickets, createSupportTicket, addTicketMessage, updateTicketStatus } from '../services/api';

interface SupportSectionProps {
  activeRole: UserRole;
}

export const SupportSection: React.FC<SupportSectionProps> = ({ activeRole }) => {
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketItem | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);

  // New Ticket Form State
  const [newSubject, setNewSubject] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newType, setNewType] = useState<string>('GENERAL');
  const [newPriority, setNewPriority] = useState<TicketPriority>('MEDIUM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await fetchSupportTickets();
      setTickets(data);
      if (selectedTicket) {
        const updatedSel = data.find((t) => t.id === selectedTicket.id || t.ticketNumber === selectedTicket.ticketNumber);
        if (updatedSel) setSelectedTicket(updatedSel);
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createSupportTicket({
        subject: newSubject,
        description: newDescription,
        type: newType,
        priority: newPriority,
      });

      setShowNewModal(false);
      setNewSubject('');
      setNewDescription('');
      setNewType('GENERAL');
      setNewPriority('MEDIUM');
      await loadTickets();
    } catch (err) {
      console.error('Error creating ticket:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    const ticketId = selectedTicket.id || selectedTicket._id || selectedTicket.ticketNumber;
    await addTicketMessage(ticketId, replyMessage, activeRole, activeRole === 'CUSTOMER' ? 'Abebe Bikila' : 'Support Desk');
    setReplyMessage('');
    await loadTickets();
  };

  const handleStatusChange = async (ticketId: string, status: TicketStatus) => {
    await updateTicketStatus(ticketId, status);
    await loadTickets();
  };

  const getPriorityBadgeStyle = (priority: TicketPriority) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'MEDIUM':
        return 'bg-sky-500/20 text-sky-400 border-sky-500/40';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  const getStatusBadgeStyle = (status: TicketStatus) => {
    switch (status) {
      case 'RESOLVED':
      case 'CLOSED':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'IN_PROGRESS':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      default:
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    }
  };

  return (
    <section className="py-8 space-y-6">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <span>🎧</span> Customer Support & Dispute Resolution Desk
          </h2>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px', marginBottom: 0 }}>
            Track inquiries, order custom fit adjustments, payment issues, and live agent dispute resolution
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="btn-primary"
          style={{ fontSize: '0.75rem', padding: '8px 16px' }}
        >
          <span>+</span> Open Support Ticket
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading support tickets...</div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
          {/* Ticket Queue List */}
          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Tickets List ({tickets.length})
            </h3>

            {tickets.length === 0 ? (
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-center text-xs text-slate-500">
                No active support tickets found.
              </div>
            ) : (
              tickets.map((t) => {
                const isSel = selectedTicket?.ticketNumber === t.ticketNumber;
                return (
                  <div
                    key={t.ticketNumber}
                    onClick={() => setSelectedTicket(t)}
                    className="glass-card"
                    style={{
                      cursor: 'pointer',
                      padding: '16px',
                      textAlign: 'left',
                      borderColor: isSel ? 'rgba(245, 158, 11, 0.8)' : 'rgba(255, 255, 255, 0.08)',
                      background: isSel ? 'rgba(30, 41, 59, 0.8)' : 'rgba(15, 23, 42, 0.6)',
                      boxShadow: isSel ? '0 0 0 1px rgba(245, 158, 11, 0.3)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#fcd34d' }}>
                        #{t.ticketNumber}
                      </span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <span className="badge" style={{ fontSize: '10px' }}>
                          {t.priority}
                        </span>
                        <span className="badge badge-gold" style={{ fontSize: '10px' }}>
                          {t.status}
                        </span>
                      </div>
                    </div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'white', margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</h4>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{t.description}</p>
                    <div style={{ marginTop: '12px', fontSize: '10px', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Category: {t.type}</span>
                      <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Ticket Thread & Message Window */}
          <div style={{ flex: '2 1 500px' }}>
            {!selectedTicket ? (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-sm">
                Select a support ticket from the list to view live message thread and post replies.
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col h-full min-h-[450px]">
                {/* Thread Header */}
                <div className="border-b border-slate-800 pb-4 mb-4 flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        #{selectedTicket.ticketNumber}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getStatusBadgeStyle(selectedTicket.status)}`}>
                        {selectedTicket.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-1">{selectedTicket.subject}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Submitted by: {selectedTicket.userId} ({selectedTicket.userRole})
                    </p>
                  </div>

                  {/* Status update buttons */}
                  <div className="flex gap-2 flex-wrap">
                    {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(selectedTicket.id || selectedTicket.ticketNumber, st as TicketStatus)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                          selectedTicket.status === st
                            ? 'bg-amber-500/30 border-amber-400 text-amber-300 font-bold'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Stream */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
                  {selectedTicket.messages?.map((msg, idx) => {
                    const isUser = msg.senderRole === 'CUSTOMER';
                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border max-w-[85%] text-xs space-y-1 ${
                          isUser
                            ? 'bg-slate-800/90 border-slate-700 ml-auto'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-100'
                        }`}
                      >
                        <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1 gap-2">
                          <span className="font-bold text-slate-300">{msg.senderName} ({msg.senderRole})</span>
                          <span>{new Date(msg.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-200 leading-relaxed">{msg.message}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder={`Reply as ${activeRole}...`}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition"
                  >
                    Send Reply 💬
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Ticket Modal */}
      {showNewModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', padding: '16px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '448px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'white', margin: 0 }}>Open Support Ticket</h3>
              <button
                onClick={() => setShowNewModal(false)}
                style={{ all: 'unset', cursor: 'pointer', color: '#94a3b8', fontSize: '1.25rem' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', marginBottom: '4px' }}>Inquiry Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '8px', padding: '8px 12px', color: 'white', outline: 'none' }}
                >
                  <option value="GENERAL">General Question</option>
                  <option value="ORDER_ISSUE">Order / Garment Fitting Issue</option>
                  <option value="PAYMENT_ISSUE">Payment Verification</option>
                  <option value="COMPLAINT">Tailor Workshop Complaint</option>
                  <option value="DISPUTE">Dispute</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: '#94a3b8', marginBottom: '4px' }}>Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as TicketPriority)}
                  style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '8px', padding: '8px 12px', color: 'white', outline: 'none' }}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: '#94a3b8', marginBottom: '4px' }}>Subject *</label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Summary of issue or request"
                  style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '8px', padding: '8px 12px', color: 'white', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#94a3b8', marginBottom: '4px' }}>Detailed Description *</label>
                <textarea
                  required
                  rows={4}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe your request in detail..."
                  style={{ width: '100%', backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '8px', padding: '12px', color: 'white', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ paddingTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  style={{ all: 'unset', cursor: 'pointer', padding: '6px 12px', color: '#94a3b8' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                  style={{ opacity: isSubmitting ? 0.5 : 1, padding: '8px 16px', fontSize: '0.75rem', borderRadius: '8px' }}
                >
                  {isSubmitting ? 'Submitting...' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
