import { useState, useEffect, useRef } from 'react';
import { cache, CACHE_TTL } from '../lib/cache';
import { tickPrices, getAllMarketData, getMarketData, getPriceHistory } from '../lib/marketSimulator';
import type { MarketData } from '../types';

export function useMarketData(symbol?: string) {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    function update() {
      tickPrices();

      const cacheKey = symbol ? `market:${symbol}` : 'market:all';
      const cached = cache.get<MarketData[]>(cacheKey);

      if (cached) {
        setMarketData(cached);
      } else {
        const data = symbol ? [getMarketData(symbol)].filter(Boolean) as MarketData[] : getAllMarketData();
        cache.set(cacheKey, data, CACHE_TTL.MARKET_DATA);
        setMarketData(data);
      }

      if (symbol) {
        setPriceHistory(getPriceHistory(symbol));
      }
    }

    update();
    intervalRef.current = setInterval(update, 1500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [symbol]);

  const current = symbol ? marketData.find(d => d.symbol === symbol) ?? null : null;

  return { marketData, current, priceHistory };
}
