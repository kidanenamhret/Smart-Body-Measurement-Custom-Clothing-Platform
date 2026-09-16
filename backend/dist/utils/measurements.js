"use strict";
/**
 * Anatomical Measurement Registry and Conversion Utilities
 * Internal standard unit: Centimeters (cm)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MEASUREMENT_REGISTRY = void 0;
exports.normalizeMeasurementValue = normalizeMeasurementValue;
exports.verifyRequiredMeasurements = verifyRequiredMeasurements;
exports.MEASUREMENT_REGISTRY = {
    // --- BASIC ---
    height: {
        key: 'height',
        name: 'Height',
        category: 'BASIC',
        standardUnit: 'cm',
        minPlausible: 50,
        maxPlausible: 260,
        description: 'Total standing height from top of head to floor',
    },
    weight: {
        key: 'weight',
        name: 'Weight',
        category: 'BASIC',
        standardUnit: 'kg',
        minPlausible: 20,
        maxPlausible: 300,
        description: 'Body weight in kilograms',
    },
    bodyShape: {
        key: 'bodyShape',
        name: 'Body Shape',
        category: 'BASIC',
        standardUnit: 'type',
        minPlausible: 0,
        maxPlausible: 0,
        description: 'General body silhouette (e.g., RECTANGLE, HOURGLASS, INVERTED_TRIANGLE, PEAR, OVAL, ATHLETIC)',
    },
    // --- UPPER BODY ---
    neck: {
        key: 'neck',
        name: 'Neck Circumference',
        category: 'UPPER_BODY',
        standardUnit: 'cm',
        minPlausible: 20,
        maxPlausible: 65,
        description: 'Circumference around the base of the neck',
    },
    shoulder: {
        key: 'shoulder',
        name: 'Shoulder Width',
        category: 'UPPER_BODY',
        standardUnit: 'cm',
        minPlausible: 25,
        maxPlausible: 75,
        description: 'Distance across the shoulders from acromion to acromion',
    },
    chest: {
        key: 'chest',
        name: 'Chest / Bust Circumference',
        category: 'UPPER_BODY',
        standardUnit: 'cm',
        minPlausible: 50,
        maxPlausible: 190,
        description: 'Circumference around the fullest part of the chest',
    },
    waist: {
        key: 'waist',
        name: 'Waist Circumference',
        category: 'UPPER_BODY',
        standardUnit: 'cm',
        minPlausible: 40,
        maxPlausible: 180,
        description: 'Circumference at natural waistline (above belly button)',
    },
    backWidth: {
        key: 'backWidth',
        name: 'Back Width',
        category: 'UPPER_BODY',
        standardUnit: 'cm',
        minPlausible: 25,
        maxPlausible: 75,
        description: 'Width across the back between armpit creases',
    },
    armLength: {
        key: 'armLength',
        name: 'Arm Length',
        category: 'UPPER_BODY',
        standardUnit: 'cm',
        minPlausible: 35,
        maxPlausible: 100,
        description: 'Length from shoulder point to wrist bone',
    },
    sleeveLength: {
        key: 'sleeveLength',
        name: 'Sleeve Length',
        category: 'UPPER_BODY',
        standardUnit: 'cm',
        minPlausible: 30,
        maxPlausible: 100,
        description: 'Center back of neck, across shoulder to wrist',
    },
    bicep: {
        key: 'bicep',
        name: 'Bicep Circumference',
        category: 'UPPER_BODY',
        standardUnit: 'cm',
        minPlausible: 15,
        maxPlausible: 65,
        description: 'Circumference around the widest part of upper arm',
    },
    elbow: {
        key: 'elbow',
        name: 'Elbow Circumference',
        category: 'UPPER_BODY',
        standardUnit: 'cm',
        minPlausible: 15,
        maxPlausible: 55,
        description: 'Circumference around bent elbow joint',
    },
    wrist: {
        key: 'wrist',
        name: 'Wrist Circumference',
        category: 'UPPER_BODY',
        standardUnit: 'cm',
        minPlausible: 10,
        maxPlausible: 30,
        description: 'Circumference around wrist bone',
    },
    shirtLength: {
        key: 'shirtLength',
        name: 'Shirt Length',
        category: 'UPPER_BODY',
        standardUnit: 'cm',
        minPlausible: 40,
        maxPlausible: 110,
        description: 'From base of neck to desired shirt hemline',
    },
    jacketLength: {
        key: 'jacketLength',
        name: 'Jacket Length',
        category: 'UPPER_BODY',
        standardUnit: 'cm',
        minPlausible: 50,
        maxPlausible: 120,
        description: 'From base of collar down center back to suit jacket hem',
    },
    // --- LOWER BODY ---
    hip: {
        key: 'hip',
        name: 'Hip Circumference',
        category: 'LOWER_BODY',
        standardUnit: 'cm',
        minPlausible: 50,
        maxPlausible: 200,
        description: 'Circumference around the widest point of hips and buttocks',
    },
    thigh: {
        key: 'thigh',
        name: 'Thigh Circumference',
        category: 'LOWER_BODY',
        standardUnit: 'cm',
        minPlausible: 30,
        maxPlausible: 95,
        description: 'Circumference around the fullest part of the upper thigh',
    },
    knee: {
        key: 'knee',
        name: 'Knee Circumference',
        category: 'LOWER_BODY',
        standardUnit: 'cm',
        minPlausible: 20,
        maxPlausible: 65,
        description: 'Circumference around knee joint',
    },
    calf: {
        key: 'calf',
        name: 'Calf Circumference',
        category: 'LOWER_BODY',
        standardUnit: 'cm',
        minPlausible: 20,
        maxPlausible: 65,
        description: 'Circumference around the widest part of lower leg',
    },
    ankle: {
        key: 'ankle',
        name: 'Ankle Circumference',
        category: 'LOWER_BODY',
        standardUnit: 'cm',
        minPlausible: 14,
        maxPlausible: 40,
        description: 'Circumference just above the ankle bone',
    },
    inseam: {
        key: 'inseam',
        name: 'Inseam Length',
        category: 'LOWER_BODY',
        standardUnit: 'cm',
        minPlausible: 45,
        maxPlausible: 115,
        description: 'Inside of leg from crotch to desired hem',
    },
    outseam: {
        key: 'outseam',
        name: 'Outseam Length',
        category: 'LOWER_BODY',
        standardUnit: 'cm',
        minPlausible: 60,
        maxPlausible: 145,
        description: 'From waistband on side of hip to bottom of hem',
    },
    rise: {
        key: 'rise',
        name: 'Crotch Rise',
        category: 'LOWER_BODY',
        standardUnit: 'cm',
        minPlausible: 18,
        maxPlausible: 50,
        description: 'Distance from crotch seam to top of waistband',
    },
    trouserLength: {
        key: 'trouserLength',
        name: 'Trouser Length',
        category: 'LOWER_BODY',
        standardUnit: 'cm',
        minPlausible: 60,
        maxPlausible: 145,
        description: 'Total desired length for trousers/pants',
    },
};
/**
 * Standardize input values to internal standard units (cm for length, kg for weight).
 */
function normalizeMeasurementValue(key, rawVal, unit) {
    const normUnit = (unit || 'cm').toLowerCase().trim();
    // If unit is inches, convert to cm (1 in = 2.54 cm)
    if (normUnit === 'in' || normUnit === 'inch' || normUnit === 'inches' || normUnit === '"') {
        const inCm = Math.round(rawVal * 2.54 * 100) / 100;
        return { value: inCm, unit: 'cm' };
    }
    // If unit is lbs, convert to kg (1 lb = 0.453592 kg)
    if (normUnit === 'lbs' || normUnit === 'lb' || normUnit === 'pounds') {
        const inKg = Math.round(rawVal * 0.45359237 * 100) / 100;
        return { value: inKg, unit: 'kg' };
    }
    // Default: round to 2 decimals
    return { value: Math.round(rawVal * 100) / 100, unit: key === 'weight' ? 'kg' : 'cm' };
}
/**
 * Verify that all required measurements exist and satisfy plausible domain validation bounds.
 */
function verifyRequiredMeasurements(requiredKeys, userMeasurements) {
    const missingKeys = [];
    const invalidKeys = [];
    const errors = [];
    if (!requiredKeys || requiredKeys.length === 0) {
        return { isValid: true, missingKeys: [], invalidKeys: [], errors: [] };
    }
    for (const key of requiredKeys) {
        const item = userMeasurements ? userMeasurements[key] : undefined;
        // Check presence
        if (item === undefined || item === null) {
            missingKeys.push(key);
            errors.push(`Missing required measurement: '${key}'`);
            continue;
        }
        // Extract numeric value
        const val = typeof item === 'object' ? Number(item.value) : Number(item);
        if (isNaN(val) || val <= 0) {
            invalidKeys.push({ key, value: item, reason: 'Value must be a positive number' });
            errors.push(`Invalid measurement value for '${key}'`);
            continue;
        }
        // Range check against REGISTRY bounds
        const def = exports.MEASUREMENT_REGISTRY[key];
        if (def && def.minPlausible > 0) {
            if (val < def.minPlausible || val > def.maxPlausible) {
                invalidKeys.push({
                    key,
                    value: val,
                    reason: `Out of plausible range (${def.minPlausible} - ${def.maxPlausible} ${def.standardUnit})`,
                });
                errors.push(`Measurement '${key}' (${val} cm) is outside expected anatomical range (${def.minPlausible}–${def.maxPlausible} cm)`);
            }
        }
    }
    return {
        isValid: missingKeys.length === 0 && invalidKeys.length === 0,
        missingKeys,
        invalidKeys,
        errors,
    };
}
