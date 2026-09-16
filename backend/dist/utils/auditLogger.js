"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeMetadata = sanitizeMetadata;
exports.logAuditEvent = logAuditEvent;
const AuditLog_1 = require("../models/AuditLog");
const SENSITIVE_KEYS = [
    'password',
    'token',
    'secret',
    'authorization',
    'authheader',
    'cvv',
    'cardnumber',
    'apikey',
    'privatekey',
    'pin',
];
function sanitizeMetadata(metadata) {
    if (!metadata)
        return undefined;
    const sanitized = {};
    for (const [key, value] of Object.entries(metadata)) {
        const lowerKey = key.toLowerCase();
        if (SENSITIVE_KEYS.some((sensitive) => lowerKey.includes(sensitive))) {
            sanitized[key] = '[REDACTED_SENSITIVE_DATA]';
        }
        else if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
            sanitized[key] = sanitizeMetadata(value);
        }
        else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}
async function logAuditEvent(actor, action, resource, resourceId, metadata, ipAddress) {
    try {
        const sanitizedMeta = sanitizeMetadata(metadata);
        await AuditLog_1.AuditLog.create({
            actor: {
                userId: actor.userId || 'system',
                role: actor.role || 'SYSTEM',
                name: actor.name || 'System Engine',
                email: actor.email,
            },
            action,
            resource,
            resourceId,
            timestamp: new Date(),
            metadata: sanitizedMeta,
            ipAddress,
        });
    }
    catch (err) {
        console.error('Failed to persist audit log record:', err);
    }
}
