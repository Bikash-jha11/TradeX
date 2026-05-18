import { useState } from 'react';
import { TrendingUp, TrendingDown, Search } from 'lucide-react';
import { useMarketData } from '../../hooks/useMarketData';

const CATEGORIES = ['all', 'forex', 'crypto', 'commodity', 'index'];

const INSTRUMENT_CATEGORIES: Record<string, string> = {
  EURUSD: 'forex', GBPUSD: 'forex', USDJPY: 'forex', USDCHF: 'forex',
  AUDUSD: 'forex', USDCAD: 'forex', NZDUSD: 'forex', EURGBP: 'forex',
  EURJPY: 'forex', GBPJPY: 'forex', EURCHF: 'forex', AUDJPY: 'forex',
  USDSEK: 'forex', USDNOK: 'forex',
  BTCUSD: 'crypto', ETHUSD: 'crypto', LTCUSD: 'crypto', XRPUSD: 'crypto', ADAUSD: 'crypto',
  XAUUSD: 'commodity', XAGUSD: 'commodity', USOIL: 'commodity', UKOIL: 'commodity',
  US500: 'index', US100: 'index', US30: 'index', GER40: 'index', UK100: 'index',
};

interface MarketsProps {
  onTrade: (symbol: string) => void;
}

function formatPrice(price: number, symbol: string): string {
  if (['BTCUSD', 'US500', 'US100', 'US30', 'GER40', 'UK100'].includes(symbol)) return price.toFixed(2);
  if (['USDJPY', 'EURJPY', 'GBPJPY', 'AUDJPY'].includes(symbol)) return price.toFixed(3);
  if (['XAUUSD', 'XAGUSD', 'USOIL', 'UKOIL', 'ETHUSD', 'LTCUSD'].includes(symbol)) return price.toFixed(2);
  return price.toFixed(5);
}

export function Markets({ onTrade }: MarketsProps) {
  const { marketData } = useMarketData();
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = marketData.filter(d => {
    if (category !== 'all' && INSTRUMENT_CATEGORIES[d.symbol] !== category) return false;
    if (search && !d.symbol.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search instruments..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 text-sm transition-colors"
          />
        </div>
        <div className="flex bg-gray-900 border border-gray-800 rounded-xl p-1 gap-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                category === cat ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Market stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Instruments', value: marketData.length.toString() },
          { label: 'Gainers', value: marketData.filter(d => d.change_percent_24h > 0).length.toString() },
          { label: 'Losers', value: marketData.filter(d => d.change_percent_24h < 0).length.toString() },
          { label: 'Avg Change', value: `${(marketData.reduce((s, d) => s + Math.abs(d.change_percent_24h), 0) / marketData.length || 0).toFixed(2)}%` },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-gray-400 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Markets table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                {['Instrument', 'Bid', 'Ask', 'Change', 'Change %', '24h High', '24h Low', 'Volume', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-gray-500 text-xs font-medium uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filtered.map(item => {
                const isUp = item.change_percent_24h >= 0;
                const cat = INSTRUMENT_CATEGORIES[item.symbol] ?? 'forex';
                const catColors: Record<string, string> = {
                  forex: 'bg-blue-500/10 text-blue-400',
                  crypto: 'bg-amber-500/10 text-amber-400',
                  commodity: 'bg-yellow-500/10 text-yellow-400',
                  index: 'bg-cyan-500/10 text-cyan-400',
                };
                return (
                  <tr key={item.symbol} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${catColors[cat]}`}>
                          {item.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-white font-medium text-sm">{item.symbol}</div>
                          <div className={`text-xs px-1.5 py-0.5 rounded inline-block mt-0.5 ${catColors[cat]}`}>{cat}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-white font-mono text-sm">{formatPrice(item.bid, item.symbol)}</td>
                    <td className="px-5 py-4 text-white font-mono text-sm">{formatPrice(item.ask, item.symbol)}</td>
                    <td className={`px-5 py-4 text-sm font-medium ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isUp ? '+' : ''}{item.change_24h.toFixed(item.symbol === 'BTCUSD' ? 2 : 5)}
                    </td>
                    <td className={`px-5 py-4`}>
                      <div className={`flex items-center gap-1 ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                        <span className="text-sm font-medium">{isUp ? '+' : ''}{item.change_percent_24h.toFixed(2)}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-sm font-mono">{formatPrice(item.high_24h, item.symbol)}</td>
                    <td className="px-5 py-4 text-gray-400 text-sm font-mono">{formatPrice(item.low_24h, item.symbol)}</td>
                    <td className="px-5 py-4 text-gray-400 text-sm">{(item.volume_24h / 1000).toFixed(1)}K</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => onTrade(item.symbol)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-medium px-4 py-1.5 rounded-lg transition-colors"
                      >
                        Trade
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
