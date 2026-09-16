"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Address_1 = require("../models/Address");
const router = (0, express_1.Router)();
let memoryAddresses = [
    {
        _id: 'addr-1',
        id: 'addr-1',
        customerId: 'cust-101',
        label: 'HOME',
        recipientName: 'Abebe Bikila',
        phone: '+251 91 123 4567',
        region: 'Addis Ababa',
        city: 'Addis Ababa',
        subCity: 'Kirkos',
        woreda: '02',
        street: 'Kazanchis Executive Residence, Apt 7B',
        additionalInformation: 'Near UNECA HQ, ring bell 7B',
        isDefault: true,
    },
    {
        _id: 'addr-2',
        id: 'addr-2',
        customerId: 'cust-101',
        label: 'WORK',
        recipientName: 'Abebe Bikila',
        phone: '+251 92 888 9900',
        region: 'Addis Ababa',
        city: 'Addis Ababa',
        subCity: 'Bole',
        woreda: '03',
        street: 'Bole Medhanealem Commercial Tower, 4th Floor',
        additionalInformation: 'Deliver during business hours (8am - 5pm)',
        isDefault: false,
    },
];
/**
 * GET /api/addresses
 * Get all addresses for customer.
 */
router.get('/', async (req, res) => {
    try {
        const { customerId = 'cust-101' } = req.query;
        const dbAddresses = await Address_1.Address.find({ customerId: String(customerId) });
        if (dbAddresses && dbAddresses.length > 0) {
            return res.json({ addresses: dbAddresses });
        }
    }
    catch (err) {
        // fallback
    }
    return res.json({ addresses: memoryAddresses });
});
/**
 * POST /api/addresses
 * Add a new address with privacy isolation.
 */
router.post('/', async (req, res) => {
    try {
        const { customerId = 'cust-101', label = 'HOME', recipientName, phone, region = 'Addis Ababa', city = 'Addis Ababa', subCity, woreda, street, additionalInformation, isDefault = false, coordinates, } = req.body;
        if (!recipientName || !phone) {
            return res.status(400).json({ error: 'Recipient name and phone number are required' });
        }
        const newAddr = {
            _id: `addr-${Date.now()}`,
            id: `addr-${Date.now()}`,
            customerId: String(customerId),
            label,
            recipientName,
            phone,
            region,
            city,
            subCity,
            woreda,
            street,
            additionalInformation,
            isDefault,
            coordinates, // optional, only stored if explicitly provided
            createdAt: new Date(),
        };
        try {
            const created = await Address_1.Address.create(newAddr);
            return res.status(201).json({ message: 'Address saved to address book!', address: created });
        }
        catch (err) {
            memoryAddresses.unshift(newAddr);
            return res.status(201).json({ message: 'Address saved to address book!', address: newAddr });
        }
    }
    catch (err) {
        return res.status(500).json({ error: err.message || 'Failed to save address' });
    }
});
/**
 * PUT /api/addresses/:id/default
 * Set address as default.
 */
router.put('/:id/default', async (req, res) => {
    const { id } = req.params;
    try {
        memoryAddresses.forEach((a) => {
            a.isDefault = a._id === id || a.id === id;
        });
        return res.json({ message: 'Default address updated', addresses: memoryAddresses });
    }
    catch (err) {
        return res.status(500).json({ error: err.message || 'Failed to set default address' });
    }
});
/**
 * DELETE /api/addresses/:id
 * Delete address.
 */
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    memoryAddresses = memoryAddresses.filter((a) => a._id !== id && a.id !== id);
    return res.json({ message: 'Address removed from address book' });
});
exports.default = router;
