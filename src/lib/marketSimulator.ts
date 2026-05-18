import type { MarketData } from '../types';

const BASE_PRICES: Record<string, number> = {
  EURUSD: 1.08547, GBPUSD: 1.27322, USDJPY: 149.830, USDCHF: 0.89240,
  AUDUSD: 0.65437, USDCAD: 1.35676, NZDUSD: 0.60129, EURGBP: 0.85239,
  EURJPY: 162.541, GBPJPY: 190.885, EURCHF: 0.96351, AUDJPY: 97.883,
  USDSEK: 10.4543, USDNOK: 10.6246,
  BTCUSD: 67240.00, ETHUSD: 3457.03, LTCUSD: 89.50, XRPUSD: 0.54327, ADAUSD: 0.45683,
  XAUUSD: 2034.60, XAGUSD: 23.467, USOIL: 78.249, UKOIL: 82.473,
  US500: 5234.75, US100: 18457.00, US30: 39236.00, GER40: 18124.50, UK100: 7835.25,
};

const SPREADS: Record<string, number> = {
  EURUSD: 0.00010, GBPUSD: 0.00013, USDJPY: 0.010, USDCHF: 0.00012,
  AUDUSD: 0.00011, USDCAD: 0.00012, NZDUSD: 0.00015, EURGBP: 0.00012,
  EURJPY: 0.014, GBPJPY: 0.018, EURCHF: 0.00014, AUDJPY: 0.016,
  USDSEK: 0.00050, USDNOK: 0.00050,
  BTCUSD: 5.00, ETHUSD: 1.50, LTCUSD: 0.20, XRPUSD: 0.00050, ADAUSD: 0.00030,
  XAUUSD: 0.20, XAGUSD: 0.020, USOIL: 0.030, UKOIL: 0.035,
  US500: 0.50, US100: 1.00, US30: 2.00, GER40: 1.50, UK100: 1.00,
};

const VOLATILITY: Record<string, number> = {
  EURUSD: 0.00008, GBPUSD: 0.00010, USDJPY: 0.010, USDCHF: 0.00007,
  AUDUSD: 0.00008, USDCAD: 0.00009, NZDUSD: 0.00009, EURGBP: 0.00007,
  EURJPY: 0.012, GBPJPY: 0.015, EURCHF: 0.00008, AUDJPY: 0.011,
  USDSEK: 0.00040, USDNOK: 0.00040,
  BTCUSD: 50.0, ETHUSD: 8.0, LTCUSD: 0.5, XRPUSD: 0.00040, ADAUSD: 0.00030,
  XAUUSD: 0.50, XAGUSD: 0.010, USOIL: 0.050, UKOIL: 0.055,
  US500: 2.0, US100: 5.0, US30: 15.0, GER40: 8.0, UK100: 4.0,
};

const currentPrices = new Map<string, number>(Object.entries(BASE_PRICES));
const priceHistory = new Map<string, number[]>();

function randomWalk(current: number, volatility: number): number {
  const change = (Math.random() - 0.495) * volatility * 2;
  return Math.max(current + change, current * 0.9);
}

export function tickPrices(): void {
  for (const [symbol, price] of currentPrices.entries()) {
    const vol = VOLATILITY[symbol] ?? price * 0.0001;
    const newPrice = randomWalk(price, vol);
    currentPrices.set(symbol, newPrice);

    const history = priceHistory.get(symbol) ?? [];
    history.push(newPrice);
    if (history.length > 200) history.shift();
    priceHistory.set(symbol, history);
  }
}

export function getMarketData(symbol: string): MarketData | null {
  const price = currentPrices.get(symbol);
  if (price === undefined) return null;

  const spread = SPREADS[symbol] ?? price * 0.0001;
  const basePrice = BASE_PRICES[symbol] ?? price;
  const change = price - basePrice;
  const changePct = (change / basePrice) * 100;

  const history = priceHistory.get(symbol) ?? [price];
  const high = Math.max(...history, price);
  const low = Math.min(...history, price);

  return {
    symbol,
    bid: price,
    ask: price + spread,
    last_price: price,
    change_24h: change,
    change_percent_24h: changePct,
    high_24h: high,
    low_24h: low,
    volume_24h: Math.random() * 1000000 + 500000,
    cached_at: new Date().toISOString(),
  };
}

export function getAllMarketData(): MarketData[] {
  return Array.from(currentPrices.keys())
    .map(getMarketData)
    .filter((d): d is MarketData => d !== null);
}

export function getPriceHistory(symbol: string): number[] {
  return priceHistory.get(symbol) ?? [BASE_PRICES[symbol] ?? 1];
}

export function getBasePrice(symbol: string): number {
  return BASE_PRICES[symbol] ?? 1;
}
