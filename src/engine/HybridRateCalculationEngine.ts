/**
 * Hybrid Rate Calculation Engine for Ramchandra and Sons Jewellers
 * Computes live showroom bullion tickers, spreads, and trend movements
 * from raw market spot inputs and admin formula configurations.
 */

export interface MarketBaseRates {
  goldUsd: number;       // Spot Gold in USD/oz (e.g. 4153.99)
  silverUsd: number;     // Spot Silver in USD/oz (e.g. 57.08)
  goldInrBase: number;   // Raw Spot Gold 10g INR base (e.g. 147420.00)
  silverInrBase: number; // Raw Spot Silver 1kg INR base (e.g. 210751.00)
  usdInr: number;        // USD to INR conversion rate (e.g. 86.50)
  updatedAt: string;
}

export interface RateConfiguration {
  gold999Offset: number;        // Premium/duty added to goldInrBase (e.g. +3293)
  silverBankOffset: number;     // Bank delivery & hallmark margin for 1kg (e.g. +5530)
  localMoharOffset: number;     // Deduction for Kasganj Mohar local purity (e.g. -2163)
  silverCoin10gMargin: number;  // Minting & packaging margin for 10g coin (e.g. +52)
  bidAskSpread: number;         // Inter-bank spread for Bid/Ask display (e.g. 80)
  isManualOverride: boolean;    // Flag to bypass automated spot formulas
  overrideGoldRate?: number | null;
  overrideSilverRate?: number | null;
  storeNotice?: string;
}

export interface CalculatedRateItem {
  id: string;
  symbol: string;
  name: string;
  purity: string;
  unit: string;
  price: number;
  formattedPrice: string;
  previousPrice: number;
  diff: number;
  formattedDiff: string;
  direction: 'up' | 'down' | 'unchanged';
  badgeStyle: 'accent' | 'green' | 'plain';
  lastUpdated: string;
}

export interface CalculatedSpreadItem {
  id: string;
  source: string;
  bid: number;
  ask: number;
  formattedBid: string;
  formattedAsk: string;
  bidStatus: 'soft-red' | 'soft-green' | 'plain';
  askStatus: 'soft-red' | 'soft-green' | 'plain';
  isCurrency?: boolean;
}

export interface HybridCalculationResult {
  rates: CalculatedRateItem[];
  spreads: CalculatedSpreadItem[];
  calculatedAt: string;
  isOverrideActive: boolean;
}

/**
 * Utility to format numbers into Indian Numbering System (e.g. 1,50,713)
 */
export function formatINR(val: number): string {
  if (isNaN(val)) return '0';
  return Math.round(val).toLocaleString('en-IN');
}

export function formatDecimal(val: number, decimals: number = 2): string {
  return val.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Pure calculation function:
 * Takes raw spot rates, configuration offsets, and previous price states,
 * and produces the exact rates and spread table according to the business rules.
 */
export function calculateHybridBullionRates(
  base: MarketBaseRates,
  config: RateConfiguration,
  previousRatesMap?: Record<string, number>
): HybridCalculationResult {
  const prevMap = previousRatesMap || {};

  // 1. Compute Gold 999: base_gold_inr + gold_999_offset (or manual override)
  let finalGold999: number;
  if (config.isManualOverride && config.overrideGoldRate != null && config.overrideGoldRate > 0) {
    finalGold999 = Math.round(config.overrideGoldRate);
  } else {
    finalGold999 = Math.round(base.goldInrBase + config.gold999Offset);
  }

  // 2. Compute Silver Bank: base_silver_inr + silver_bank_offset (or manual override)
  let finalSilverBank: number;
  if (config.isManualOverride && config.overrideSilverRate != null && config.overrideSilverRate > 0) {
    finalSilverBank = Math.round(config.overrideSilverRate);
  } else {
    finalSilverBank = Math.round(base.silverInrBase + config.silverBankOffset);
  }

  // 3. Compute Kasganj Mohar: Final Gold 999 - local_mohar_offset
  const finalKasganjMohar = Math.round(finalGold999 - config.localMoharOffset);

  // 4. Compute Silver Coin 10gm: (Final Silver Bank / 100) + silver_coin_10g_margin
  const finalSilverCoin10g = Math.round((finalSilverBank / 100) + config.silverCoin10gMargin);

  // Helper to determine movement direction and diff
  const computeMovement = (id: string, currentPrice: number, defaultPrevDelta: number = 0) => {
    const prev = prevMap[id] != null ? prevMap[id] : currentPrice - defaultPrevDelta;
    const diff = Math.abs(currentPrice - prev);
    let direction: 'up' | 'down' | 'unchanged' = 'unchanged';
    if (currentPrice > prev) direction = 'up';
    else if (currentPrice < prev) direction = 'down';

    return {
      previousPrice: prev,
      diff,
      direction,
      formattedDiff: formatINR(diff)
    };
  };

  // Build the 4 Live Bullion Rate Cards
  const goldMovement = computeMovement('gold-999', finalGold999, 1630);
  const silverMovement = computeMovement('silver-bank', finalSilverBank, 3732);
  const moharMovement = computeMovement('kasganj-mohar', finalKasganjMohar, 3694);
  const coinMovement = computeMovement('silver-coin-10gm', finalSilverCoin10g, 40);

  const rates: CalculatedRateItem[] = [
    {
      id: 'gold-999',
      symbol: 'GOLD999',
      name: 'Gold 999',
      purity: '24K 99.9%',
      unit: '10 gm',
      price: finalGold999,
      formattedPrice: formatINR(finalGold999),
      previousPrice: goldMovement.previousPrice,
      diff: goldMovement.diff,
      formattedDiff: goldMovement.formattedDiff,
      direction: goldMovement.direction,
      badgeStyle: 'accent',
      lastUpdated: 'Live'
    },
    {
      id: 'silver-bank',
      symbol: 'SILVERBANK',
      name: 'Silver Bank',
      purity: '99.9% Fine',
      unit: '1 kg',
      price: finalSilverBank,
      formattedPrice: formatINR(finalSilverBank),
      previousPrice: silverMovement.previousPrice,
      diff: silverMovement.diff,
      formattedDiff: silverMovement.formattedDiff,
      direction: silverMovement.direction,
      badgeStyle: 'green',
      lastUpdated: 'Live'
    },
    {
      id: 'kasganj-mohar',
      symbol: 'KASGANJMOHAR',
      name: 'Kasganj Mohar',
      purity: 'Local Hallmark',
      unit: '10 gm',
      price: finalKasganjMohar,
      formattedPrice: formatINR(finalKasganjMohar),
      previousPrice: moharMovement.previousPrice,
      diff: moharMovement.diff,
      formattedDiff: moharMovement.formattedDiff,
      direction: moharMovement.direction,
      badgeStyle: 'green',
      lastUpdated: 'Live'
    },
    {
      id: 'silver-coin-10gm',
      symbol: 'SILVERCOIN10G',
      name: 'Silver Coin 10gm',
      purity: '999 Fine',
      unit: '10 gm',
      price: finalSilverCoin10g,
      formattedPrice: formatINR(finalSilverCoin10g),
      previousPrice: coinMovement.previousPrice,
      diff: coinMovement.diff,
      formattedDiff: coinMovement.formattedDiff,
      direction: coinMovement.direction,
      badgeStyle: 'plain',
      lastUpdated: 'Live'
    }
  ];

  // 5. Bid / Ask Spreads calculation
  const silverBid = Math.round(base.silverInrBase);
  const silverAsk = Math.round(base.silverInrBase + config.bidAskSpread);

  const goldBid = Math.round(base.goldInrBase);
  const goldAsk = Math.round(base.goldInrBase + 52); // standard 10gm gold bank spread

  const spreads: CalculatedSpreadItem[] = [
    {
      id: 'spread-silver',
      source: 'Silver',
      bid: silverBid,
      ask: silverAsk,
      formattedBid: formatINR(silverBid),
      formattedAsk: formatINR(silverAsk),
      bidStatus: 'soft-red',
      askStatus: 'soft-green'
    },
    {
      id: 'spread-gold',
      source: 'Gold',
      bid: goldBid,
      ask: goldAsk,
      formattedBid: formatINR(goldBid),
      formattedAsk: formatINR(goldAsk),
      bidStatus: 'soft-green',
      askStatus: 'soft-red'
    },
    {
      id: 'spread-gold-usd',
      source: 'Gold ($)',
      bid: base.goldUsd,
      ask: Number((base.goldUsd + 0.32).toFixed(2)),
      formattedBid: formatDecimal(base.goldUsd, 2),
      formattedAsk: formatDecimal(base.goldUsd + 0.32, 2),
      bidStatus: 'soft-red',
      askStatus: 'soft-red'
    },
    {
      id: 'spread-silver-usd',
      source: 'Silver ($)',
      bid: base.silverUsd,
      ask: Number((base.silverUsd + 0.02).toFixed(2)),
      formattedBid: formatDecimal(base.silverUsd, 2),
      formattedAsk: formatDecimal(base.silverUsd + 0.02, 2),
      bidStatus: 'soft-red',
      askStatus: 'soft-red'
    },
    {
      id: 'spread-inr',
      source: 'INR',
      bid: 95.05,
      ask: 95.09,
      formattedBid: '95.05',
      formattedAsk: '95.09',
      bidStatus: 'plain',
      askStatus: 'plain',
      isCurrency: true
    }
  ];

  return {
    rates,
    spreads,
    calculatedAt: new Date().toISOString(),
    isOverrideActive: config.isManualOverride
  };
}

/**
 * State container for the calculation engine.
 * Useful for Node backends, Supabase Edge Functions, or in-memory simulation.
 */
export class HybridRateCalculationEngine {
  private baseRates: MarketBaseRates;
  private config: RateConfiguration;
  private previousPrices: Record<string, number> = {};
  private currentResult: HybridCalculationResult;
  private listeners: Set<(result: HybridCalculationResult) => void> = new Set();

  constructor(initialBase?: Partial<MarketBaseRates>, initialConfig?: Partial<RateConfiguration>) {
    this.baseRates = {
      goldUsd: 4153.99,
      silverUsd: 57.08,
      goldInrBase: 147420.00,
      silverInrBase: 210751.00,
      usdInr: 86.50,
      updatedAt: new Date().toISOString(),
      ...initialBase
    };

    this.config = {
      gold999Offset: 3293.00,
      silverBankOffset: 5530.00,
      localMoharOffset: 2163.00,
      silverCoin10gMargin: 52.00,
      bidAskSpread: 80.00,
      isManualOverride: false,
      overrideGoldRate: null,
      overrideSilverRate: null,
      storeNotice: 'Indicative rates only. Confirm at store. We don’t sell bullion.',
      ...initialConfig
    };

    this.currentResult = this.recalculate();
  }

  public getSnapshot(): HybridCalculationResult {
    return this.currentResult;
  }

  public getBaseRates(): MarketBaseRates {
    return { ...this.baseRates };
  }

  public getConfig(): RateConfiguration {
    return { ...this.config };
  }

  public updateBaseRates(newBase: Partial<MarketBaseRates>): HybridCalculationResult {
    // Record current prices as previous before updating
    this.currentResult.rates.forEach(r => {
      this.previousPrices[r.id] = r.price;
    });

    this.baseRates = {
      ...this.baseRates,
      ...newBase,
      updatedAt: new Date().toISOString()
    };
    return this.recalculate();
  }

  public updateConfig(newConfig: Partial<RateConfiguration>): HybridCalculationResult {
    this.config = {
      ...this.config,
      ...newConfig
    };
    return this.recalculate();
  }

  public subscribe(listener: (result: HybridCalculationResult) => void): () => void {
    this.listeners.add(listener);
    listener(this.currentResult);
    return () => this.listeners.delete(listener);
  }

  private recalculate(): HybridCalculationResult {
    this.currentResult = calculateHybridBullionRates(this.baseRates, this.config, this.previousPrices);
    this.listeners.forEach(fn => fn(this.currentResult));
    return this.currentResult;
  }
}
