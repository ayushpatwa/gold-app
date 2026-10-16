import { BullionRate, JewelleryProduct, SpreadItem, StoreProfile } from '../types';

export const INITIAL_STORE_PROFILE: StoreProfile = {
  name: "Ramchandra and Sons Jewellers",
  tagline: "Crafted with care · Main Market, Kasganj",
  monogram: "RSJ",
  phone: "+91-5744-245980",
  whatsapp: "+919837012345",
  email: "contact@ramchandraandsons.com",
  address: "Main Market, Near Ghanta Ghar, Kasganj, Uttar Pradesh 207123",
  city: "Kasganj",
  googleMapsUrl: "https://maps.google.com/?q=Ramchandra+and+Sons+Jewellers+Main+Market+Kasganj",
  instagramDda: "@ramchandra_sons",
  instagramHeritage: "@rsj_heritage",
  website: "ramchandraandsons.com",
  disclaimer: "Indicative rates only. Confirm at store. We don’t sell bullion.",
  appVersion: "1.0.24 (38)"
};

export const INITIAL_BULLION_RATES: BullionRate[] = [
  {
    id: 'gold-999',
    name: 'Gold 999',
    purity: '24K 99.9%',
    unit: '10 gm',
    price: 150713,
    change: 1630,
    direction: 'up',
    badgeStyle: 'accent',
    lastUpdated: 'Just now'
  },
  {
    id: 'silver-bank',
    name: 'Silver Bank',
    purity: '99.9% Fine',
    unit: '1 kg',
    price: 216281,
    change: 3732,
    direction: 'up',
    badgeStyle: 'green',
    lastUpdated: 'Just now'
  },
  {
    id: 'kasganj-mohar',
    name: 'Kasganj Mohar',
    purity: 'Local Hallmark',
    unit: '10 gm',
    price: 214118,
    change: 3694,
    direction: 'up',
    badgeStyle: 'green',
    lastUpdated: 'Just now'
  },
  {
    id: 'silver-coin-10gm',
    name: 'Silver Coin 10gm',
    purity: '999 Fine',
    unit: '10 gm',
    price: 2215,
    change: 40,
    direction: 'up',
    badgeStyle: 'plain',
    lastUpdated: 'Just now'
  }
];

export const INITIAL_SPREADS: SpreadItem[] = [
  {
    id: 'spread-silver',
    source: 'Silver',
    bid: '2,10,751',
    ask: '2,10,831',
    bidStatus: 'red',
    askStatus: 'green'
  },
  {
    id: 'spread-gold',
    source: 'Gold',
    bid: '1,47,420',
    ask: '1,47,472',
    bidStatus: 'green',
    askStatus: 'red'
  },
  {
    id: 'spread-gold-usd',
    source: 'Gold ($)',
    bid: '4,153.99',
    ask: '4,154.31',
    bidStatus: 'red',
    askStatus: 'red'
  },
  {
    id: 'spread-silver-usd',
    source: 'Silver ($)',
    bid: '57.08',
    ask: '57.10',
    bidStatus: 'red',
    askStatus: 'red'
  },
  {
    id: 'spread-inr',
    source: 'INR',
    bid: '95.05',
    ask: '95.09',
    isCurrency: true
  }
];

export const INITIAL_PRODUCTS: JewelleryProduct[] = [
  {
    id: 'rsj-nk-033',
    sku: 'RSJ-NK-033',
    title: 'Violet Collar Necklace Set with Pink Floral Accent',
    category: 'Necklaces',
    collection: 'Gold',
    gender: 'Female',
    description: 'Violet multi-row collar necklace with clear leaf-like center links, an asymmetric pink focal motif and warm-gold branch accents, with matching drop earrings. Handcrafted for royal occasions and discerning collectors.',
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=85'
    ],
    goldPurity: '14K',
    grossWeight: 103.840,
    netGoldWeight: 83.620,
    diamondWeight: 15.03,
    coloredStoneWeight: 86.07,
    availability: 'Contact the showroom to confirm availability.',
    featured: true,
    createdAt: '2026-10-10'
  },
  {
    id: 'rsj-nk-034',
    sku: 'RSJ-NK-034',
    title: 'Teal Asymmetric Chevron Necklace Set',
    category: 'Necklaces',
    collection: 'Gold',
    gender: 'Female',
    description: 'Bespoke collar crafted in 18K yellow gold with cascading natural teal tourmalines and brilliant cut VVS diamonds with matching teardrop ear pendants.',
    images: [
      'https://images.unsplash.com/photo-1611591475155-426462615557?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=85'
    ],
    goldPurity: '18K',
    grossWeight: 92.450,
    netGoldWeight: 74.200,
    diamondWeight: 11.80,
    coloredStoneWeight: 62.15,
    availability: 'Available in Showroom',
    featured: true,
    createdAt: '2026-10-11'
  },
  {
    id: 'rsj-nk-035',
    sku: 'RSJ-NK-035',
    title: 'Green Cascade Floral Collar Necklace',
    category: 'Necklaces',
    collection: 'Gold',
    gender: 'Female',
    description: 'Intricate filigree and hand-set Zambian emerald leaves cascading over a diamond pave trellis. A signature showpiece from the Ramchandra and Sons high jewellery salon.',
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=85'
    ],
    goldPurity: '18K',
    grossWeight: 118.200,
    netGoldWeight: 91.500,
    diamondWeight: 18.25,
    coloredStoneWeight: 95.40,
    availability: 'Contact the showroom to confirm availability.',
    featured: true,
    createdAt: '2026-10-12'
  },
  {
    id: 'rsj-sl-009',
    sku: 'RSJ-SL-009',
    title: 'Heritage Embossed Silver Mayur Pedestal Bowl',
    category: 'Silver',
    collection: 'Silver',
    gender: 'Unisex',
    description: 'Solid 92.5 Sterling Silver ornamental centerpiece handcrafted by master silversmiths with embossed Mughal peacock motifs and fluted scallop rim.',
    images: [
      'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=85'
    ],
    goldPurity: '925 Silver',
    grossWeight: 425.600,
    netGoldWeight: 0,
    availability: 'Available in Showroom',
    featured: true,
    createdAt: '2026-10-08'
  },
  {
    id: 'rsj-br-021',
    sku: 'RSJ-BR-021',
    title: 'Royal Kundan & Polki Bridal Haar Set',
    category: 'Bridal',
    collection: 'Bridal',
    gender: 'Female',
    description: 'Regal bridal set handcrafted in 22K hallmarked yellow gold featuring uncut syndicate polki diamonds, south sea pearls, and meenakari enameling on reverse.',
    images: [
      'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=85'
    ],
    goldPurity: '22K',
    grossWeight: 185.320,
    netGoldWeight: 142.800,
    diamondWeight: 22.40,
    coloredStoneWeight: 45.10,
    availability: 'Made to Order',
    featured: true,
    createdAt: '2026-10-09'
  },
  {
    id: 'rsj-dm-014',
    sku: 'RSJ-DM-014',
    title: 'Solitaire Blossom Diamond Cocktail Ring',
    category: 'Diamond',
    collection: 'Diamond',
    gender: 'Female',
    description: 'GIA certified 2.50ct round brilliant centre diamond enveloped in a double halo of marquise-cut diamonds mounted in 18K white gold.',
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=85'
    ],
    goldPurity: '18K',
    grossWeight: 9.850,
    netGoldWeight: 8.900,
    diamondWeight: 4.25,
    availability: 'Available in Showroom',
    featured: true,
    createdAt: '2026-10-13'
  }
];

export const CATEGORIES = [
  {
    id: 'Gold',
    title: 'Gold',
    subtitle: 'Browse the Ramchandra and Sons Gold collection',
    buttonText: 'Explore Gold',
    accentColor: '#C18B27',
    image: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 'Silver',
    title: 'Silver',
    subtitle: 'Browse the Ramchandra and Sons Silver collection',
    buttonText: 'Explore Silver',
    accentColor: '#6B7280',
    image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 'Diamond',
    title: 'Diamond',
    subtitle: 'Solitaires, bridal cuts, and fine diamond jewellery',
    buttonText: 'Explore Diamonds',
    accentColor: '#2563EB',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 'Bridal',
    title: 'Bridal Heritage',
    subtitle: 'Magnificent bridal sets for your once-in-a-lifetime moments',
    buttonText: 'Explore Bridal',
    accentColor: '#9F1239',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=85'
  }
];
