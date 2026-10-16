import { useState, useEffect, useCallback, useRef } from 'react';
import {
  HybridRateCalculationEngine,
  HybridCalculationResult,
  CalculatedRateItem,
  CalculatedSpreadItem,
  RateConfiguration
} from '../engine/HybridRateCalculationEngine';

export interface UseLiveRatesReturn {
  rates: CalculatedRateItem[];
  spreads: CalculatedSpreadItem[];
  lastUpdated: string;
  isConnected: boolean;
  isOverrideActive: boolean;
  storeNotice: string;
  refreshRates: () => void;
  updateAdminConfig: (cfg: Partial<RateConfiguration>) => void;
}

// Global shared engine instance for singleton state across the application
const globalRateEngine = new HybridRateCalculationEngine();

export function useLiveRates(): UseLiveRatesReturn {
  const [snapshot, setSnapshot] = useState<HybridCalculationResult>(() => globalRateEngine.getSnapshot());
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [storeNotice, setStoreNotice] = useState<string>(globalRateEngine.getConfig().storeNotice || 'Indicative rates only. Confirm at store. We don’t sell bullion.');

  // Subscribe to real-time engine changes
  useEffect(() => {
    const unsubscribe = globalRateEngine.subscribe((newResult) => {
      setSnapshot(newResult);
      setStoreNotice(globalRateEngine.getConfig().storeNotice || 'Indicative rates only. Confirm at store. We don’t sell bullion.');
    });

    // Real-time market tick simulation every 4-6 seconds
    const interval = setInterval(() => {
      const currentBase = globalRateEngine.getBaseRates();
      // Realistic random-walk market fluctuations
      const deltaGold = (Math.random() > 0.46 ? 1 : -1) * Math.floor(Math.random() * 65 + 10);
      const deltaSilver = (Math.random() > 0.48 ? 1 : -1) * Math.floor(Math.random() * 95 + 15);

      globalRateEngine.updateBaseRates({
        goldInrBase: Math.max(100000, currentBase.goldInrBase + deltaGold),
        silverInrBase: Math.max(150000, currentBase.silverInrBase + deltaSilver),
        goldUsd: Number((currentBase.goldUsd + (deltaGold / 86.5)).toFixed(2)),
        silverUsd: Number((currentBase.silverUsd + (deltaSilver / 86.5 / 31.1)).toFixed(2))
      });
    }, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const refreshRates = useCallback(() => {
    const currentBase = globalRateEngine.getBaseRates();
    const deltaGold = (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 40 + 5);
    globalRateEngine.updateBaseRates({
      goldInrBase: currentBase.goldInrBase + deltaGold
    });
  }, []);

  const updateAdminConfig = useCallback((cfg: Partial<RateConfiguration>) => {
    globalRateEngine.updateConfig(cfg);
    if (cfg.storeNotice) {
      setStoreNotice(cfg.storeNotice);
    }
  }, []);

  return {
    rates: snapshot.rates,
    spreads: snapshot.spreads,
    lastUpdated: snapshot.calculatedAt,
    isConnected,
    isOverrideActive: snapshot.isOverrideActive,
    storeNotice,
    refreshRates,
    updateAdminConfig
  };
}
