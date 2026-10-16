// api/rates.js - Real-time Bullion API Endpoint for Vercel
// Integrated with Metals.dev Live API (MCX & IBJA Indian Domestic Rates)

const METALS_DEV_API_KEY = process.env.METALS_DEV_API_KEY || 'RTRSCDVC6TWMUUWHFTVQ955WHFTVQ';

// In-memory cache to conserve API requests and provide sub-second responses
let cachedRateResponse = null;
let lastFetchTimestamp = 0;
const CACHE_DURATION_MS = 45 * 1000; // 45 seconds cache

export default async function handler(req, res) {
  // CORS & Cache-Control headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const now = Date.now();

  // Return cached data if fresh (saves API quota)
  if (cachedRateResponse && (now - lastFetchTimestamp) < CACHE_DURATION_MS) {
    return res.status(200).json({
      ...cachedRateResponse,
      cached: true,
      timeRemainingSec: Math.round((CACHE_DURATION_MS - (now - lastFetchTimestamp)) / 1000)
    });
  }

  try {
    const url = `https://api.metals.dev/v1/latest?api_key=${METALS_DEV_API_KEY}&currency=INR&unit=g`;
    const apiRes = await fetch(url, { headers: { 'Accept': 'application/json' } });

    if (!apiRes.ok) {
      throw new Error(`Metals.dev API responded with HTTP ${apiRes.status}`);
    }

    const data = await apiRes.json();

    if (data.status !== 'success' || !data.metals) {
      throw new Error('Metals.dev returned non-success status');
    }

    const metals = data.metals;
    const currencies = data.currencies || {};
    const usdInr = Number(currencies.USD || 94.965);

    // 1. Indian Benchmark Gold 999:
    // Priority: MCX Gold (per gram) -> IBJA Gold -> Spot with 18% duty
    const goldPerGramInr = metals.mcx_gold || metals.ibja_gold || (metals.gold * 1.18);
    const finalGold999 = Math.round(goldPerGramInr * 10);

    // 2. Indian Benchmark Silver Bank (1 kg):
    // Priority: MCX Silver (per gram) * 1000 -> IBJA Silver * 1000 -> Spot with 22% duty
    const silverPerGramInr = metals.mcx_silver || metals.ibja_silver || (metals.silver * 1.22);
    const finalSilverBank = Math.round(silverPerGramInr * 1000);

    // 3. Kasganj Mohar (10 gm) = Final Gold 999 - Local Mohar Offset (approx ₹2,163)
    const finalKasganjMohar = finalGold999 - 2163;

    // 4. Silver Coin 10gm = (Final Silver Bank / 100) + Coin Margin
    const finalSilverCoin10g = Math.round(finalSilverBank / 100) + 52;

    // Global Spot in USD (1 troy ounce = 31.1034768 grams)
    const TROY_OUNCE = 31.1034768;
    const goldUsd = Number(((metals.gold * TROY_OUNCE) / usdInr).toFixed(2));
    const silverUsd = Number(((metals.silver * TROY_OUNCE) / usdInr).toFixed(2));

    // Dynamic Bid / Ask Spreads around market rates
    const spreads = [
      {
        source: 'Silver',
        bid: Math.round(finalSilverBank - 80),
        ask: Math.round(finalSilverBank + 80),
        bidStatus: 'soft-red',
        askStatus: 'soft-green'
      },
      {
        source: 'Gold',
        bid: Math.round(finalGold999 - 52),
        ask: Math.round(finalGold999 + 52),
        bidStatus: 'soft-green',
        askStatus: 'soft-red'
      },
      {
        source: 'Gold ($)',
        bid: goldUsd.toFixed(2),
        ask: (goldUsd + 0.35).toFixed(2),
        bidStatus: 'soft-red',
        askStatus: 'soft-red'
      },
      {
        source: 'Silver ($)',
        bid: silverUsd.toFixed(2),
        ask: (silverUsd + 0.03).toFixed(2),
        bidStatus: 'soft-red',
        askStatus: 'soft-red'
      },
      {
        source: 'INR',
        bid: (usdInr - 0.04).toFixed(2),
        ask: (usdInr + 0.04).toFixed(2),
        isCurrency: true
      }
    ];

    const responsePayload = {
      success: true,
      provider: 'Metals.dev (MCX & IBJA Indian Feed)',
      timestamp: new Date().toISOString(),
      formattedTime: new Date().toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      market: {
        goldUsd,
        silverUsd,
        usdInr: Number(usdInr.toFixed(2)),
        mcxGoldPerGram: Number(goldPerGramInr.toFixed(2)),
        mcxSilverPerGram: Number(silverPerGramInr.toFixed(2))
      },
      rates: {
        gold999: finalGold999,
        silverBank: finalSilverBank,
        kasganjMohar: finalKasganjMohar,
        silverCoin10g: finalSilverCoin10g
      },
      spreads
    };

    // Update in-memory cache
    cachedRateResponse = responsePayload;
    lastFetchTimestamp = now;

    return res.status(200).json({
      ...responsePayload,
      cached: false
    });
  } catch (error) {
    console.error('Metals.dev API error:', error.message);

    // If cache exists from earlier, serve stale cache instead of failing
    if (cachedRateResponse) {
      return res.status(200).json({
        ...cachedRateResponse,
        stale: true,
        error: error.message
      });
    }

    return res.status(500).json({ success: false, error: error.message });
  }
}
