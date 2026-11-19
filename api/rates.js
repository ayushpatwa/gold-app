// api/rates.js - Real-time Bullion API Endpoint for Vercel
// Supports Angel One SmartAPI (Live MCX) with fallback to Metals.dev

import { fetchAngelOneCommodities } from './angelone.js';

const METALS_DEV_API_KEY = process.env.METALS_DEV_API_KEY || 'RTRSCDVC6TWMUUWHFTVQ955WHFTVQ';

// In-memory cache to conserve API requests and provide sub-second responses
let cachedRateResponse = null;
let lastFetchTimestamp = 0;
const CACHE_DURATION_MS = 30 * 1000; // 30 seconds cache

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
  if (cachedRateResponse && now - lastFetchTimestamp < CACHE_DURATION_MS) {
    return res.status(200).json({
      ...cachedRateResponse,
      cached: true,
      timeRemainingSec: Math.round((CACHE_DURATION_MS - (now - lastFetchTimestamp)) / 1000)
    });
  }

  // --- 1. Try Angel One SmartAPI (Primary if configured) ---
  const hasAngelConfig =
    Boolean(process.env.ANGEL_API_KEY) &&
    Boolean(process.env.ANGEL_CLIENT_CODE) &&
    Boolean(process.env.ANGEL_MPIN) &&
    Boolean(process.env.ANGEL_TOTP_SECRET);

  if (hasAngelConfig) {
    try {
      const { gold, silver } = await fetchAngelOneCommodities();

      if (gold && silver && gold.ltp && silver.ltp) {
        // MCX Gold is priced per 10 grams
        const finalGold999 = Math.round(Number(gold.ltp));
        // MCX Silver is priced per 1 kilogram
        const finalSilverBank = Math.round(Number(silver.ltp));
        // Kasganj Mohar: Local Mohar Offset (approx ₹2,163)
        const finalKasganjMohar = finalGold999 - 2163;
        // Silver Coin 10gm: (Silver Bank / 100) + Coin Margin
        const finalSilverCoin10g = Math.round(finalSilverBank / 100) + 52;

        // Depth-based or standard bid/ask spreads
        const goldBestBid = gold.depth?.buy?.[0]?.price || finalGold999 - 52;
        const goldBestAsk = gold.depth?.sell?.[0]?.price || finalGold999 + 52;
        const silverBestBid = silver.depth?.buy?.[0]?.price || finalSilverBank - 80;
        const silverBestAsk = silver.depth?.sell?.[0]?.price || finalSilverBank + 80;

        const spreads = [
          {
            source: 'Silver',
            bid: Math.round(silverBestBid),
            ask: Math.round(silverBestAsk),
            bidStatus: 'soft-red',
            askStatus: 'soft-green'
          },
          {
            source: 'Gold',
            bid: Math.round(goldBestBid),
            ask: Math.round(goldBestAsk),
            bidStatus: 'soft-green',
            askStatus: 'soft-red'
          },
          {
            source: 'Gold ($)',
            bid: (finalGold999 / 35.5).toFixed(2),
            ask: (finalGold999 / 35.5 + 0.35).toFixed(2),
            bidStatus: 'soft-red',
            askStatus: 'soft-red'
          },
          {
            source: 'Silver ($)',
            bid: (finalSilverBank / 3750).toFixed(2),
            ask: (finalSilverBank / 3750 + 0.03).toFixed(2),
            bidStatus: 'soft-red',
            askStatus: 'soft-red'
          },
          {
            source: 'INR',
            bid: '94.92',
            ask: '95.00',
            isCurrency: true
          }
        ];

        const responsePayload = {
          success: true,
          provider: 'Angel One SmartAPI (MCX Live Exchange)',
          timestamp: new Date().toISOString(),
          formattedTime: new Date().toLocaleTimeString('en-IN', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          market: {
            mcxGoldSymbol: gold.tradingSymbol || 'GOLD',
            mcxSilverSymbol: silver.tradingSymbol || 'SILVER',
            mcxGoldLtp: finalGold999,
            mcxSilverLtp: finalSilverBank
          },
          rates: {
            gold999: finalGold999,
            silverBank: finalSilverBank,
            kasganjMohar: finalKasganjMohar,
            silverCoin10g: finalSilverCoin10g
          },
          spreads
        };

        cachedRateResponse = responsePayload;
        lastFetchTimestamp = now;

        return res.status(200).json({
          ...responsePayload,
          cached: false
        });
      }
    } catch (err) {
      console.warn('Angel One fetch failed, falling back to Metals.dev:', err.message);
    }
  }

  // --- 2. Fallback to Metals.dev ---
  try {
    const url = `https://api.metals.dev/v1/latest?api_key=${METALS_DEV_API_KEY}&currency=INR&unit=g`;
    const apiRes = await fetch(url, { headers: { Accept: 'application/json' } });

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

    const goldPerGramInr = metals.mcx_gold || metals.ibja_gold || metals.gold * 1.18;
    const finalGold999 = Math.round(goldPerGramInr * 10);

    const silverPerGramInr = metals.mcx_silver || metals.ibja_silver || metals.silver * 1.22;
    const finalSilverBank = Math.round(silverPerGramInr * 1000);

    const finalKasganjMohar = finalGold999 - 2163;
    const finalSilverCoin10g = Math.round(finalSilverBank / 100) + 52;

    const TROY_OUNCE = 31.1034768;
    const goldUsd = Number(((metals.gold * TROY_OUNCE) / usdInr).toFixed(2));
    const silverUsd = Number(((metals.silver * TROY_OUNCE) / usdInr).toFixed(2));

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
      provider: 'Metals.dev (Fallback MCX & IBJA Indian Feed)',
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

    cachedRateResponse = responsePayload;
    lastFetchTimestamp = now;

    return res.status(200).json({
      ...responsePayload,
      cached: false
    });
  } catch (error) {
    console.error('Rates API error:', error.message);

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
