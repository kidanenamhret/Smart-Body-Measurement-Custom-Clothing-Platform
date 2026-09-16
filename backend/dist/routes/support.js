"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SupportTicket_1 = require("../models/SupportTicket");
const auditLogger_1 = require("../utils/auditLogger");
const router = (0, express_1.Router)();
// POST /api/support/tickets - Create new support ticket
router.post('/tickets', async (req, res) => {
    try {
        const { userId, userRole, type, orderId, subject, description, priority } = req.body;
        if (!subject || !description) {
            return res.status(400).json({ error: 'Subject and description are required' });
        }
        const ticketNumber = `TKT-${Date.now().toString(36).toUpperCase()}`;
        const ticket = await SupportTicket_1.SupportTicket.create({
            ticketNumber,
            userId: userId || '650000000000000000000001',
            userRole: userRole || 'CUSTOMER',
            type: type || 'GENERAL',
            orderId,
            subject,
            description,
            priority: priority || 'MEDIUM',
            status: 'OPEN',
            messages: [
                {
                    senderId: userId || '650000000000000000000001',
                    senderRole: userRole || 'CUSTOMER',
                    senderName: 'Customer',
                    message: description,
                    createdAt: new Date(),
                },
            ],
        });
        await (0, auditLogger_1.logAuditEvent)({ userId: String(userId || 'customer'), role: userRole || 'CUSTOMER' }, 'CREATE_SUPPORT_TICKET', 'SupportTicket', String(ticket._id), { ticketNumber, subject, priority: priority || 'MEDIUM' });
        return res.status(201).json({
            message: 'Support ticket created successfully!',
            ticket,
        });
    }
    catch (err) {
        console.error('Error creating support ticket:', err);
        return res.status(500).json({ error: 'Internal server error creating support ticket', details: err.message });
    }
});
// GET /api/support/tickets - Fetch tickets
router.get('/tickets', async (req, res) => {
    try {
        const tickets = await SupportTicket_1.SupportTicket.find().sort({ updatedAt: -1 });
        return res.json({ tickets });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to fetch support tickets', details: err.message });
    }
});
// POST /api/support/tickets/:id/messages - Append message
router.post('/tickets/:id/messages', async (req, res) => {
    try {
        const { id } = req.params;
        const { senderId, senderRole, senderName, message } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message content is required' });
        }
        const ticket = await SupportTicket_1.SupportTicket.findById(id);
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        ticket.messages.push({
            senderId: senderId || ticket.userId,
            senderRole: senderRole || 'ADMIN',
            senderName: senderName || 'Support Agent',
            message,
            createdAt: new Date(),
        });
        // Auto update status if agent replied
        if (senderRole === 'ADMIN' && ticket.status === 'OPEN') {
            ticket.status = 'IN_PROGRESS';
        }
        await ticket.save();
        return res.json({
            message: 'Message added to ticket thread',
            ticket,
        });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to post reply message', details: err.message });
    }
});
// PATCH /api/support/tickets/:id/status - Update ticket status
router.patch('/tickets/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, resolutionNotes, actorRole } = req.body;
        const validStatuses = ['OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: `Invalid ticket status. Must be one of: ${validStatuses.join(', ')}` });
        }
        const ticket = await SupportTicket_1.SupportTicket.findById(id);
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        const prevStatus = ticket.status;
        ticket.status = status;
        if (resolutionNotes)
            ticket.resolutionNotes = resolutionNotes;
        await ticket.save();
        await (0, auditLogger_1.logAuditEvent)({ userId: 'admin', role: actorRole || 'ADMIN' }, 'UPDATE_TICKET_STATUS', 'SupportTicket', String(ticket._id), { ticketNumber: ticket.ticketNumber, prevStatus, newStatus: status, resolutionNotes });
        return res.json({
            message: `Ticket status updated from '${prevStatus}' to '${status}'`,
            ticket,
        });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to update ticket status', details: err.message });
    }
});
exports.default = router;
