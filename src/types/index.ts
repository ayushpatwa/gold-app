export interface BullionRate {
  id: string;
  name: string;
  purity?: string;
  unit: string;
  price: number;
  change: number;
  direction: 'up' | 'down';
  badgeStyle?: 'accent' | 'green' | 'plain';
  lastUpdated: string;
}

export interface SpreadItem {
  id: string;
  source: string;
  bid: number | string;
  ask: number | string;
  bidStatus?: 'green' | 'red';
  askStatus?: 'green' | 'red';
  unit?: string;
  isCurrency?: boolean;
}

export interface JewelleryProduct {
  id: string;
  sku: string;
  title: string;
  category: 'Gold' | 'Silver' | 'Diamond' | 'Bridal' | 'Necklaces' | 'Earrings' | 'Bangles' | 'Rings';
  collection: 'Gold' | 'Silver' | 'Diamond' | 'Heritage' | 'Bridal';
  gender: 'Female' | 'Male' | 'Unisex';
  description: string;
  images: string[];
  goldPurity: '14K' | '18K' | '22K' | '24K' | '925 Silver';
  grossWeight: number; // in grams
  netGoldWeight: number; // in grams
  diamondWeight?: number; // in carats
  coloredStoneWeight?: number; // in carats
  availability: 'Available in Showroom' | 'Contact the showroom to confirm availability.' | 'Made to Order';
  featured?: boolean;
  createdAt: string;
}

export interface StoreProfile {
  name: string;
  tagline: string;
  monogram: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  googleMapsUrl: string;
  instagramDda: string;
  instagramHeritage: string;
  website: string;
  disclaimer: string;
  appVersion: string;
}

export interface AppState {
  bullionRates: BullionRate[];
  spreads: SpreadItem[];
  products: JewelleryProduct[];
  storeProfile: StoreProfile;
  pushNotificationsEnabled: boolean;
  activeTab: 'rates' | 'gallery' | 'settings' | 'admin';
  selectedProductId: string | null;
  selectedCategory: string | null;
}
