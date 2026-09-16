"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = void 0;
exports.logAdminAction = logAdminAction;
const auditLogger_1 = require("../utils/auditLogger");
/**
 * Ensures authenticated user has role 'ADMIN'.
 */
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Forbidden: Administrator privileges required.' });
    }
    next();
};
exports.requireAdmin = requireAdmin;
/**
 * Utility helper to record administrative actions into the Audit Log.
 */
async function logAdminAction(adminId, action, targetEntity, targetId, details, req) {
    try {
        const ipAddress = req ? req.headers['x-forwarded-for'] || req.socket.remoteAddress : undefined;
        await (0, auditLogger_1.logAuditEvent)({ userId: adminId.toString(), role: 'ADMIN' }, action, targetEntity, targetId ? targetId.toString() : undefined, details, ipAddress);
    }
    catch (error) {
        console.error('Failed to write audit log:', error.message);
    }
}
