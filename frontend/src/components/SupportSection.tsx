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
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '450px', padding: '24px' }}>
                {/* Thread Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '16px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#fcd34d' }}>
                        #{selectedTicket.ticketNumber}
                      </span>
                      <span className="badge badge-gold" style={{ fontSize: '10px' }}>
                        {selectedTicket.status}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'white', marginTop: '4px', marginBottom: 0 }}>{selectedTicket.subject}</h3>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px', marginBottom: 0 }}>
                      Submitted by: {selectedTicket.userId} ({selectedTicket.userRole})
                    </p>
                  </div>

                  {/* Status update buttons */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(selectedTicket.id || selectedTicket.ticketNumber, st as TicketStatus)}
                        style={{
                          all: 'unset', cursor: 'pointer', fontSize: '11px', padding: '4px 10px', borderRadius: '8px', transition: 'all 0.2s',
                          ...(selectedTicket.status === st
                            ? { backgroundColor: 'rgba(245, 158, 11, 0.3)', border: '1px solid #fcd34d', color: '#fde68a', fontWeight: 'bold' }
                            : { backgroundColor: 'rgba(30, 41, 59, 0.8)', border: '1px solid #334155', color: '#94a3b8' }
                          )
                        }}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Stream */}
                <div style={{ flex: '1 1 auto', overflowY: 'auto', paddingRight: '8px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedTicket.messages?.map((msg, idx) => {
                    const isUser = msg.senderRole === 'CUSTOMER';
                    return (
                      <div
                        key={idx}
                        style={{
                          padding: '14px', borderRadius: '12px', maxWidth: '85%', fontSize: '0.75rem',
                          ...(isUser
                            ? { backgroundColor: 'rgba(30, 41, 59, 0.9)', border: '1px solid #334155', marginLeft: 'auto' }
                            : { backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#fef3c7' }
                          )
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#94a3b8', marginBottom: '4px', gap: '8px' }}>
                          <span style={{ fontWeight: 'bold', color: '#cbd5e1' }}>{msg.senderName} ({msg.senderRole})</span>
                          <span>{new Date(msg.createdAt).toLocaleString()}</span>
                        </div>
                        <p style={{ color: '#e2e8f0', lineHeight: '1.6', margin: 0 }}>{msg.message}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendReply} style={{ paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder={`Reply as ${activeRole}...`}
                    style={{ flex: 1, backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px', padding: '10px 16px', fontSize: '0.75rem', color: 'white', outline: 'none' }}
                  />
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ padding: '10px 16px', fontSize: '0.75rem', borderRadius: '12px' }}
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
