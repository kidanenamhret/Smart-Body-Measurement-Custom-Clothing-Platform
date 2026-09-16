import { IClothingProduct } from '../models/ClothingProduct';

export interface PriceLineItem {
  groupKey: string;
  groupName: string;
  choiceName: string;
  priceModifier: number;
}

export interface PriceCalculationResult {
  basePrice: number;
  currency: string;
  lineItems: PriceLineItem[];
  customizationModifiersTotal: number;
  totalCalculatedPrice: number;
}

/**
 * Authoritative Server-Side Price Calculation
 * NEVER TRUST TOTAL PRICE SUPPLIED BY FRONTEND.
 * Computes base price + all valid selected customization price modifiers.
 */
export function calculateGarmentPrice(
  product: IClothingProduct,
  selectedCustomizations: Record<string, any>
): PriceCalculationResult {
  const basePrice = Number(product.basePrice) || 0;
  const currency = product.currency || 'ETB';
  const lineItems: PriceLineItem[] = [];

  let customizationModifiersTotal = 0;

  if (!selectedCustomizations || typeof selectedCustomizations !== 'object') {
    return {
      basePrice,
      currency,
      lineItems: [],
      customizationModifiersTotal: 0,
      totalCalculatedPrice: basePrice,
    };
  }

  const customOpts = product.customizationOptions || {};

  // Default price rules dictionary if not explicitly specified in product schema
  const DEFAULT_PRICE_MODIFIERS: Record<string, Record<string, number>> = {
    fabric: {
      'Italian Pure Wool': 2500,
      'Cashmere Blend': 3500,
      'Velvet': 2000,
      'Shemma Woven Cotton': 1000,
      'Silk Blend': 1800,
      '100% Egyptian Cotton': 1200,
    },
    lining: {
      'Paisley Silk': 1500,
      'Monogrammed Silk': 1800,
      'Gold Satin': 1200,
    },
    buttons: {
      'Horn Buttons': 600,
      'Mother of Pearl': 800,
      'Brass Engraved': 700,
    },
    embroidery: {
      'Tibeb Royal Gold': 1500,
      'Gold Thread Custom Monogram': 800,
      'Traditional Cross Motif': 1000,
    },
  };

  for (const [groupKey, value] of Object.entries(selectedCustomizations)) {
    if (!value) continue;

    const choiceName = typeof value === 'object' ? String((value as any).name || (value as any).value) : String(value);
    let modifier = 0;

    // Check explicit product customizationOptions schema first
    const groupDef = customOpts[groupKey];
    if (groupDef) {
      if (Array.isArray(groupDef.choices)) {
        const foundChoice = groupDef.choices.find((c: any) =>
          typeof c === 'object' ? c.name === choiceName : String(c) === choiceName
        );
        if (foundChoice && typeof foundChoice === 'object' && foundChoice.priceModifier) {
          modifier = Number(foundChoice.priceModifier);
        }
      } else if (typeof groupDef === 'object' && groupDef[choiceName]) {
        const entry = groupDef[choiceName];
        if (typeof entry === 'number') modifier = entry;
        else if (typeof entry === 'object' && entry.priceModifier) modifier = Number(entry.priceModifier);
      }
    }

    // Fallback default price lookup if not defined in product schema
    if (modifier === 0 && DEFAULT_PRICE_MODIFIERS[groupKey] && DEFAULT_PRICE_MODIFIERS[groupKey][choiceName]) {
      modifier = DEFAULT_PRICE_MODIFIERS[groupKey][choiceName];
    }

    if (modifier > 0) {
      customizationModifiersTotal += modifier;
      lineItems.push({
        groupKey,
        groupName: groupKey.replace(/([A-Z])/g, ' $1').toUpperCase(),
        choiceName,
        priceModifier: modifier,
      });
    }
  }

  const totalCalculatedPrice = basePrice + customizationModifiersTotal;

  return {
    basePrice,
    currency,
    lineItems,
    customizationModifiersTotal,
    totalCalculatedPrice,
  };
}
