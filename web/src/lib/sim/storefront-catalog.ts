// Deterministic storefront catalog for the Live Agent Simulator (frontend-only demo data).

export type StoreId = 'shadowgear' | 'audiopro';
export type ProductSku = 'sm7b' | 'scarlett' | 'genelec';

export interface StorefrontProfile {
  id: StoreId;
  name: string;
  url: string;
  trust: 'UNVERIFIED' | 'VERIFIED';
  trustLabel: string;
  shipping: string;
}

export interface CatalogProduct {
  sku: ProductSku;
  title: string;
  shortTitle: string;
  category: string;
  medianUsd: number;
  stockLabel: string;
  deliveryPromise: string;
}

export const STOREFRONTS: Record<StoreId, StorefrontProfile> = {
  shadowgear: {
    id: 'shadowgear',
    name: 'ShadowGear Outlet',
    url: 'shadowgear-outlet.shop/shure-sm7b',
    trust: 'UNVERIFIED',
    trustLabel: 'Unverified seller',
    shipping: 'Ships in 5-9 days',
  },
  audiopro: {
    id: 'audiopro',
    name: 'AudioPro Supply',
    url: 'audiopro-supply.com/studio',
    trust: 'VERIFIED',
    trustLabel: 'Channel3 verified',
    shipping: 'FedEx 2-day',
  },
};

export const CATALOG: Record<ProductSku, CatalogProduct> = {
  sm7b: {
    sku: 'sm7b',
    title: 'Shure SM7B Vocal Dynamic Microphone',
    shortTitle: 'Shure SM7B',
    category: 'Studio audio',
    medianUsd: 249,
    stockLabel: 'In stock',
    deliveryPromise: 'Arrives in 48h',
  },
  scarlett: {
    sku: 'scarlett',
    title: 'Focusrite Scarlett 4i4 Audio Interface',
    shortTitle: 'Scarlett 4i4',
    category: 'Studio audio',
    medianUsd: 219,
    stockLabel: 'In stock',
    deliveryPromise: 'Arrives in 48h',
  },
  genelec: {
    sku: 'genelec',
    title: 'Genelec 8030C Studio Monitor Pair',
    shortTitle: 'Genelec 8030C',
    category: 'Studio audio',
    medianUsd: 450,
    stockLabel: 'Only 3 left',
    deliveryPromise: 'Arrives in 72h',
  },
};

/** Price an unverified store asks when the gouging hazard is on (+92.7% over median). */
export function inflatedAskUsd(medianUsd: number): number {
  return Math.round(medianUsd * 1.927);
}

export function formatUsd(value: number, withCents = false): string {
  const abs = Math.abs(value);
  const body = abs.toLocaleString('en-US', {
    minimumFractionDigits: withCents ? 2 : 0,
    maximumFractionDigits: withCents ? 2 : 0,
  });
  return `${value < 0 ? '-' : ''}$${body}`;
}
