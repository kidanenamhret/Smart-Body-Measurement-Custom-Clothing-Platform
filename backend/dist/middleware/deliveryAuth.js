"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireDeliveryAgentProfile = exports.requireDeliveryAgentRole = void 0;
const DeliveryAgent_1 = require("../models/DeliveryAgent");
/**
 * Ensures authenticated user has role 'DELIVERY_AGENT'.
 */
const requireDeliveryAgentRole = (req, res, next) => {
    if (!req.user || req.user.role !== 'DELIVERY_AGENT') {
        return res.status(403).json({ message: 'Access denied: Delivery Agent role required.' });
    }
    next();
};
exports.requireDeliveryAgentRole = requireDeliveryAgentRole;
/**
 * Ensures authenticated user has role 'DELIVERY_AGENT' and an active profile.
 */
const requireDeliveryAgentProfile = async (req, res, next) => {
    if (!req.user || req.user.role !== 'DELIVERY_AGENT') {
        return res.status(403).json({ message: 'Access denied: Delivery Agent role required.' });
    }
    try {
        const agent = await DeliveryAgent_1.DeliveryAgent.findOne({ userId: req.user.sub });
        if (!agent) {
            return res.status(404).json({
                message: 'Delivery agent profile not found. Please create your profile first.',
            });
        }
        req.deliveryAgent = agent;
        next();
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: 'Error retrieving delivery agent profile', error: error.message });
    }
};
exports.requireDeliveryAgentProfile = requireDeliveryAgentProfile;
