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
      <div className="flex justify-between items-end flex-wrap gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>🎧</span> Customer Support & Dispute Resolution Desk
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track inquiries, order custom fit adjustments, payment issues, and live agent dispute resolution
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg flex items-center gap-1.5"
        >
          <span>+</span> Open Support Ticket
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading support tickets...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket Queue List */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
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
                  <button
                    key={t.ticketNumber}
                    onClick={() => setSelectedTicket(t)}
                    className={`w-full p-4 rounded-xl border text-left transition ${
                      isSel
                        ? 'bg-slate-800 border-amber-400/80 ring-1 ring-amber-400/30'
                        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        #{t.ticketNumber}
                      </span>
                      <div className="flex gap-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getPriorityBadgeStyle(t.priority)}`}>
                          {t.priority}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getStatusBadgeStyle(t.status)}`}>
                          {t.status}
                        </span>
                      </div>
                    </div>
                    <h4 className="text-sm font-semibold text-white line-clamp-1">{t.subject}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{t.description}</p>
                    <div className="mt-3 text-[10px] text-slate-500 flex justify-between">
                      <span>Category: {t.type}</span>
                      <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Ticket Thread & Message Window */}
          <div className="lg:col-span-2">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Open Support Ticket</h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Inquiry Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                >
                  <option value="GENERAL">General Question</option>
                  <option value="ORDER_ISSUE">Order / Garment Fitting Issue</option>
                  <option value="PAYMENT_ISSUE">Payment Verification</option>
                  <option value="COMPLAINT">Tailor Workshop Complaint</option>
                  <option value="DISPUTE">Dispute</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as TicketPriority)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Summary of issue or request"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Detailed Description *</label>
                <textarea
                  required
                  rows={4}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe your request in detail..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg disabled:opacity-50"
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
