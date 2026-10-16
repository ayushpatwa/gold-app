import { BullionRate, JewelleryProduct, SpreadItem, StoreProfile } from '../types';
import { INITIAL_BULLION_RATES, INITIAL_PRODUCTS, INITIAL_SPREADS, INITIAL_STORE_PROFILE } from '../data/seedData';

type Listener = () => void;

class StoreService {
  private rates: BullionRate[] = [...INITIAL_BULLION_RATES];
  private spreads: SpreadItem[] = [...INITIAL_SPREADS];
  private products: JewelleryProduct[] = [...INITIAL_PRODUCTS];
  private profile: StoreProfile = { ...INITIAL_STORE_PROFILE };
  private listeners: Set<Listener> = new Set();
  private isLiveTickerActive: boolean = true;
  private tickerInterval: any = null;

  constructor() {
    this.loadFromStorage();
    this.startLiveTicker();
  }

  private loadFromStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const savedRates = localStorage.getItem('rsj_bullion_rates');
        if (savedRates) this.rates = JSON.parse(savedRates);

        const savedSpreads = localStorage.getItem('rsj_spreads');
        if (savedSpreads) this.spreads = JSON.parse(savedSpreads);

        const savedProducts = localStorage.getItem('rsj_products');
        if (savedProducts) this.products = JSON.parse(savedProducts);

        const savedProfile = localStorage.getItem('rsj_profile');
        if (savedProfile) this.profile = JSON.parse(savedProfile);
      } catch (e) {
        console.warn('Storage read fallback:', e);
      }
    }
  }

  private saveToStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('rsj_bullion_rates', JSON.stringify(this.rates));
        localStorage.setItem('rsj_spreads', JSON.stringify(this.spreads));
        localStorage.setItem('rsj_products', JSON.stringify(this.products));
        localStorage.setItem('rsj_profile', JSON.stringify(this.profile));
      } catch (e) {
        console.warn('Storage write fallback:', e);
      }
    }
    this.notify();
  }

  public subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public getRates(): BullionRate[] {
    return this.rates;
  }

  public getSpreads(): SpreadItem[] {
    return this.spreads;
  }

  public getProducts(): JewelleryProduct[] {
    return this.products;
  }

  public getProductById(id: string): JewelleryProduct | undefined {
    return this.products.find((p) => p.id === id);
  }

  public getStoreProfile(): StoreProfile {
    return this.profile;
  }

  public updateRate(rateId: string, updatedPrice: number, changeAmount?: number) {
    this.rates = this.rates.map((rate) => {
      if (rate.id === rateId) {
        const diff = changeAmount !== undefined ? changeAmount : updatedPrice - rate.price;
        return {
          ...rate,
          price: updatedPrice,
          change: Math.abs(diff),
          direction: diff >= 0 ? 'up' : 'down',
          lastUpdated: 'Updated just now'
        };
      }
      return rate;
    });
    this.saveToStorage();
  }

  public updateSpreads(newSpreads: SpreadItem[]) {
    this.spreads = newSpreads;
    this.saveToStorage();
  }

  public updateDisclaimer(newText: string) {
    this.profile.disclaimer = newText;
    this.saveToStorage();
  }

  public addProduct(product: Omit<JewelleryProduct, 'id' | 'createdAt'>) {
    const newProduct: JewelleryProduct = {
      ...product,
      id: 'rsj-' + Date.now().toString(36),
      createdAt: new Date().toISOString()
    };
    this.products = [newProduct, ...this.products];
    this.saveToStorage();
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<JewelleryProduct>) {
    this.products = this.products.map((p) => (p.id === id ? { ...p, ...updates } : p));
    this.saveToStorage();
  }

  public deleteProduct(id: string) {
    this.products = this.products.filter((p) => p.id !== id);
    this.saveToStorage();
  }

  public toggleLiveTicker(enable?: boolean) {
    this.isLiveTickerActive = enable !== undefined ? enable : !this.isLiveTickerActive;
    if (this.isLiveTickerActive) {
      this.startLiveTicker();
    } else if (this.tickerInterval) {
      clearInterval(this.tickerInterval);
      this.tickerInterval = null;
    }
    this.notify();
    return this.isLiveTickerActive;
  }

  public isTickerRunning(): boolean {
    return this.isLiveTickerActive;
  }

  private startLiveTicker() {
    if (this.tickerInterval) clearInterval(this.tickerInterval);

    // Realistic small bullion fluctuation every 4-6 seconds
    this.tickerInterval = setInterval(() => {
      if (!this.isLiveTickerActive) return;

      // Pick a random rate to fluctuate
      const randomIndex = Math.floor(Math.random() * this.rates.length);
      const targetRate = this.rates[randomIndex];
      const delta = (Math.random() > 0.48 ? 1 : -1) * Math.floor(Math.random() * 85 + 15);
      const newPrice = Math.max(100, targetRate.price + delta);

      this.rates = this.rates.map((r, i) =>
        i === randomIndex
          ? {
              ...r,
              price: newPrice,
              change: Math.abs(delta),
              direction: delta >= 0 ? 'up' : 'down',
              lastUpdated: 'Live update'
            }
          : r
      );

      // Also gently randomize spread bids
      if (Math.random() > 0.6) {
        this.spreads = this.spreads.map((s) => {
          if (s.id === 'spread-gold') {
            const base = 147400 + Math.floor(Math.random() * 80);
            return {
              ...s,
              bid: base.toLocaleString('en-IN'),
              ask: (base + 52).toLocaleString('en-IN'),
              bidStatus: Math.random() > 0.5 ? 'green' : 'red',
              askStatus: Math.random() > 0.5 ? 'red' : 'green'
            };
          }
          if (s.id === 'spread-silver') {
            const base = 210700 + Math.floor(Math.random() * 100);
            return {
              ...s,
              bid: base.toLocaleString('en-IN'),
              ask: (base + 80).toLocaleString('en-IN'),
              bidStatus: Math.random() > 0.5 ? 'red' : 'green',
              askStatus: Math.random() > 0.5 ? 'green' : 'red'
            };
          }
          return s;
        });
      }

      this.notify();
    }, 4500);
  }
}

export const storeService = new StoreService();
