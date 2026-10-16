// api/rates.js - Real-time Bullion API Endpoint for Vercel
// Ingests live market data and computes Kasganj Showroom rates with domestic Indian tariffs

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let goldUsd = 4178.60;
    let silverUsd = 57.25;
    let usdInr = 95.10;

    // Fetch live market data from Yahoo Finance / Gold APIs
    try {
      const [goldFetch, silverFetch, inrFetch] = await Promise.all([
        fetch('https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1m&range=1d', {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        }),
        fetch('https://query1.finance.yahoo.com/v8/finance/chart/SI=F?interval=1m&range=1d', {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        }),
        fetch('https://query1.finance.yahoo.com/v8/finance/chart/USDINR=X?interval=1m&range=1d', {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        })
      ]);

      if (goldFetch.ok) {
        const gj = await goldFetch.json();
        const price = gj?.chart?.result?.[0]?.meta?.regularMarketPrice;
        if (price) goldUsd = Number(price);
      }

      if (silverFetch.ok) {
        const sj = await silverFetch.json();
        const price = sj?.chart?.result?.[0]?.meta?.regularMarketPrice;
        if (price) silverUsd = Number(price);
      }

      if (inrFetch.ok) {
        const ij = await inrFetch.json();
        const price = ij?.chart?.result?.[0]?.meta?.regularMarketPrice;
        if (price) usdInr = Number(price);
      }
    } catch (apiErr) {
      console.warn('External finance API fallback active:', apiErr.message);
    }

    // Standard conversion: 1 Troy Ounce = 31.1034768 grams
    const TROY_OUNCE_TO_GRAMS = 31.1034768;

    // Raw Spot conversion in INR
    const rawSpotGoldPerGramInr = (goldUsd * usdInr) / TROY_OUNCE_TO_GRAMS;
    const rawSpotSilverPerKgInr = ((silverUsd * usdInr) / TROY_OUNCE_TO_GRAMS) * 1000;

    // Indian Domestic Tariff & Import Duty factor:
    // Retail physical bullion traded in Indian mandis reflects customs duty, AIDC, and local freight
    // Baseline Indian domestic benchmark:
    const gold10gDomestic = Math.round(rawSpotGoldPerGramInr * 10 * 1.18);
    const silver1kgDomestic = Math.round(rawSpotSilverPerKgInr * 1.23);

    // Kasganj Showroom Standard Formulas:
    // 1. Gold 999 (10 gm)
    const finalGold999 = gold10gDomestic;
    // 2. Silver Bank (1 kg)
    const finalSilverBank = silver1kgDomestic;
    // 3. Kasganj Mohar (10 gm) = Final Gold 999 - Local Mohar Offset (approx ₹2,163)
    const finalKasganjMohar = finalGold999 - 2163;
    // 4. Silver Coin 10gm = (Final Silver Bank / 100) + Coin Margin
    const finalSilverCoin10g = Math.round(finalSilverBank / 100) + 52;

    // Bid/Ask Spreads
    const spreads = [
      { source: 'Silver', bid: Math.round(finalSilverBank - 80), ask: Math.round(finalSilverBank + 80), bidStatus: 'soft-red', askStatus: 'soft-green' },
      { source: 'Gold', bid: Math.round(finalGold999 - 52), ask: Math.round(finalGold999 + 52), bidStatus: 'soft-green', askStatus: 'soft-red' },
      { source: 'Gold ($)', bid: goldUsd.toFixed(2), ask: (goldUsd + 0.35).toFixed(2), bidStatus: 'soft-red', askStatus: 'soft-red' },
      { source: 'Silver ($)', bid: silverUsd.toFixed(2), ask: (silverUsd + 0.03).toFixed(2), bidStatus: 'soft-red', askStatus: 'soft-red' },
      { source: 'INR', bid: (usdInr - 0.04).toFixed(2), ask: (usdInr + 0.04).toFixed(2), isCurrency: true }
    ];

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      formattedTime: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      market: {
        goldUsd,
        silverUsd,
        usdInr
      },
      rates: {
        gold999: finalGold999,
        silverBank: finalSilverBank,
        kasganjMohar: finalKasganjMohar,
        silverCoin10g: finalSilverCoin10g
      },
      spreads
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
