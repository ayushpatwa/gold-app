/**
 * LiveBullionApiService.ts
 * 
 * Free live market rate service for Ramchandra and Sons Jewellers (Kasganj).
 * Integrates with gold-api.com:
 * - 100% Free
 * - Zero API key or registration required
 * - Real-time Gold (XAU) & Silver (XAG) in INR
 * - Seamless migration path to paid APIs (GoldAPI.io, Metals.dev, Augmont, or IBJA)
 */

export interface LiveMarketFeedResponse {
  gold10gInr: number;
  silver1kgInr: number;
  goldUsd: number;
  silverUsd: number;
  usdInr: number;
  source: string;
  updatedAt: string;
}

const TROY_OUNCE_TO_GRAMS = 31.1034768;

/**
 * Fetches real-time market spot rates from free public endpoint (gold-api.com)
 */
export async function fetchFreeLiveMarketRates(): Promise<LiveMarketFeedResponse> {
  try {
    // Parallel fetch for Gold & Silver in INR
    const [goldRes, silverRes] = await Promise.all([
      fetch('https://api.gold-api.com/price/XAU/INR'),
      fetch('https://api.gold-api.com/price/XAG/INR')
    ]);

    if (!goldRes.ok || !silverRes.ok) {
      throw new Error(`API responded with status: Gold=${goldRes.status}, Silver=${silverRes.status}`);
    }

    const goldData = await goldRes.json();
    const silverData = await silverRes.json();

    // Raw prices in INR per troy ounce (~31.1035 grams)
    const goldOunceInr = Number(goldData.price);
    const silverOunceInr = Number(silverData.price);
    const usdInrRate = Number(goldData.exchangeRate) || 86.50;

    // Convert to Indian Standard Market Units:
    // Gold standard unit: 10 grams
    const gold10gInr = Math.round((goldOunceInr / TROY_OUNCE_TO_GRAMS) * 10);
    // Silver standard unit: 1 kilogram (1000 grams)
    const silver1kgInr = Math.round((silverOunceInr / TROY_OUNCE_TO_GRAMS) * 1000);

    const goldUsd = Number((goldOunceInr / usdInrRate).toFixed(2));
    const silverUsd = Number((silverOunceInr / usdInrRate).toFixed(2));

    return {
      gold10gInr,
      silver1kgInr,
      goldUsd,
      silverUsd,
      usdInr: usdInrRate,
      source: 'gold-api.com (Free Tier)',
      updatedAt: goldData.updatedAt || new Date().toISOString()
    };
  } catch (error) {
    console.warn('[LiveBullionApiService] Falling back to baseline estimates due to network/API error:', error);
    // Fallback baseline values if device has no active internet
    return {
      gold10gInr: 127300,
      silver1kgInr: 175100,
      goldUsd: 4160.50,
      silverUsd: 57.20,
      usdInr: 95.09,
      source: 'Offline Fallback',
      updatedAt: new Date().toISOString()
    };
  }
}
