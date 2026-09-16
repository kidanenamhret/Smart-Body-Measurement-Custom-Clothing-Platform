"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Notification_1 = require("../models/Notification");
const NotificationService_1 = require("../services/NotificationService");
const router = (0, express_1.Router)();
let memoryNotifications = [
    {
        _id: 'notif-1',
        id: 'notif-1',
        recipientId: 'cust-101',
        recipientRole: 'CUSTOMER',
        title: '📏 Measurement Profile Verified',
        message: 'Your body measurement profile (Bespoke Fit v3) was verified with 95%+ confidence score.',
        type: 'MEASUREMENT_READY',
        read: false,
        createdAt: new Date(Date.now() - 3600000 * 24),
    },
    {
        _id: 'notif-2',
        id: 'notif-2',
        recipientId: 'cust-101',
        recipientRole: 'CUSTOMER',
        title: '💳 Payment Verified',
        message: 'Telebirr payment for Order #ORD-2026-9001 was authoritatively verified by server API.',
        type: 'PAYMENT_SUCCESS',
        read: true,
        createdAt: new Date(Date.now() - 3600000 * 12),
    },
    {
        _id: 'notif-3',
        id: 'notif-3',
        recipientId: 'cust-101',
        recipientRole: 'CUSTOMER',
        title: '✂️ Fabric Cutting Started',
        message: 'Master tailor at Royal Habesha Couture has started cutting fabric for your custom tuxedo.',
        type: 'PRODUCTION_STARTED',
        read: false,
        createdAt: new Date(Date.now() - 3600000 * 2),
    },
];
/**
 * GET /api/notifications
 * Fetch user in-app notifications.
 */
router.get('/', async (req, res) => {
    try {
        const { recipientId = 'cust-101' } = req.query;
        const dbNotifs = await Notification_1.Notification.find({ recipientId: String(recipientId) }).sort({ createdAt: -1 });
        if (dbNotifs && dbNotifs.length > 0) {
            return res.json({ notifications: dbNotifs });
        }
    }
    catch (err) {
        // fallback
    }
    return res.json({ notifications: memoryNotifications });
});
/**
 * PATCH /api/notifications/:id/read
 * Mark notification as read.
 */
router.patch('/:id/read', async (req, res) => {
    const { id } = req.params;
    try {
        const notif = memoryNotifications.find((n) => n._id === id || n.id === id);
        if (notif)
            notif.read = true;
        return res.json({ message: 'Notification marked as read', notifications: memoryNotifications });
    }
    catch (err) {
        return res.status(500).json({ error: err.message || 'Failed to update notification' });
    }
});
/**
 * POST /api/notifications/dispatch
 * Dispatch multi-channel notification across channels (in-app, SMS, Email, Push).
 */
router.post('/dispatch', async (req, res) => {
    try {
        const { recipientId = 'cust-101', recipientRole = 'CUSTOMER', eventType = 'ORDER_CREATED', title = 'Package Update', message = 'Notification update dispatch', channels = ['in-app', 'SMS'], } = req.body;
        const result = await NotificationService_1.defaultNotificationService.dispatch({
            recipientId: String(recipientId),
            recipientRole,
            eventType: eventType,
            title,
            message,
            channels,
        });
        const newNotif = {
            _id: result.notificationId,
            id: result.notificationId,
            recipientId: String(recipientId),
            recipientRole,
            title,
            message,
            type: eventType,
            read: false,
            createdAt: new Date(),
        };
        memoryNotifications.unshift(newNotif);
        return res.status(201).json({
            message: `Notification dispatched across [${channels.join(', ')}]`,
            result,
            notification: newNotif,
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message || 'Dispatch failed' });
    }
});
exports.default = router;
