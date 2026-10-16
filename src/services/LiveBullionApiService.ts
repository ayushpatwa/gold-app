/**
 * LiveBullionApiService.ts
 * 
 * Live market rate service for Ramchandra and Sons Jewellers (Kasganj).
 * Integrates with Metals.dev Live API using user's key:
 * - Real-time MCX & IBJA Indian benchmark gold and silver rates
 * - USD/INR currency rates
 * - Kasganj showroom offsets
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

const METALS_DEV_API_KEY = process.env.METALS_DEV_API_KEY || 'RTRSCDVC6TWMUUWHFTVQ955WHFTVQ';

/**
 * Fetches real-time market spot and domestic Indian rates from Metals.dev
 */
export async function fetchLiveMarketRates(): Promise<LiveMarketFeedResponse> {
  try {
    const url = `https://api.metals.dev/v1/latest?api_key=${METALS_DEV_API_KEY}&currency=INR&unit=g`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });

    if (!res.ok) {
      throw new Error(`Metals.dev API responded with status ${res.status}`);
    }

    const data = await res.json();
    if (data.status !== 'success' || !data.metals) {
      throw new Error('Metals.dev returned unsuccessful status');
    }

    const metals = data.metals;
    const currencies = data.currencies || {};
    const usdInr = Number(currencies.USD || 94.965);

    // MCX / IBJA domestic rate in India per gram
    const goldPerGram = metals.mcx_gold || metals.ibja_gold || (metals.gold * 1.18);
    const silverPerGram = metals.mcx_silver || metals.ibja_silver || (metals.silver * 1.22);

    const gold10gInr = Math.round(goldPerGram * 10);
    const silver1kgInr = Math.round(silverPerGram * 1000);

    const TROY_OUNCE = 31.1034768;
    const goldUsd = Number(((metals.gold * TROY_OUNCE) / usdInr).toFixed(2));
    const silverUsd = Number(((metals.silver * TROY_OUNCE) / usdInr).toFixed(2));

    return {
      gold10gInr,
      silver1kgInr,
      goldUsd,
      silverUsd,
      usdInr,
      source: 'Metals.dev (MCX & IBJA Indian Feed)',
      updatedAt: data.timestamps?.metal || new Date().toISOString()
    };
  } catch (error) {
    console.warn('[LiveBullionApiService] Falling back to baseline estimates due to network/API error:', error);
    return {
      gold10gInr: 147918,
      silver1kgInr: 211187,
      goldUsd: 4158.57,
      silverUsd: 56.93,
      usdInr: 94.97,
      source: 'Offline Fallback',
      updatedAt: new Date().toISOString()
    };
  }
}
