import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useMarketData } from '../../hooks/useMarketData';
import type { Profile, Position } from '../../types';

interface DashboardProps {
  profile: Profile | null;
  positions: Position[];
  onNavigate: (page: 'trading' | 'markets') => void;
}

const WATCHLIST = ['EURUSD', 'GBPUSD', 'BTCUSD', 'XAUUSD', 'US500'];

function MiniChart({ prices }: { prices: number[] }) {
  if (prices.length < 2) return null;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const w = 80;
  const h = 32;
  const points = prices.slice(-20).map((p, i, arr) => {
    const x = (i / (arr.length - 1)) * w;
    const y = h - ((p - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');
  const isUp = prices[prices.length - 1] >= prices[0];
  return (
    <svg width={w} height={h} className="opacity-80">
      <polyline points={points} fill="none" stroke={isUp ? '#10b981' : '#ef4444'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WatchlistItem({ symbol, onTrade }: { symbol: string; onTrade: () => void }) {
  const { current, priceHistory } = useMarketData(symbol);
  if (!current) return null;
  const isUp = current.change_percent_24h >= 0;
  return (
    <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-all group">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {symbol.slice(0, 2)}
        </div>
        <div>
          <div className="text-white text-sm font-medium">{symbol}</div>
          <div className={`text-xs ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
            {isUp ? '+' : ''}{current.change_percent_24h.toFixed(2)}%
          </div>
        </div>
      </div>
      <MiniChart prices={priceHistory} />
      <div className="text-right">
        <div className="text-white text-sm font-mono">{current.bid.toFixed(symbol === 'BTCUSD' ? 2 : symbol === 'USDJPY' ? 3 : 5)}</div>
        <button
          onClick={onTrade}
          className="text-xs text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 hover:text-emerald-300"
        >
          Trade
        </button>
      </div>
    </div>
  );
}

export function Dashboard({ profile, positions, onNavigate }: DashboardProps) {
  const { marketData } = useMarketData();
  const openPnL = positions.reduce((sum, p) => sum + (p.profit_loss ?? 0), 0);
  const balance = profile?.balance ?? 0;
  const equity = balance + openPnL;
  const margin = positions.reduce((sum, p) => sum + (p.margin_used ?? 0), 0);
  const freeMargin = equity - margin;
  const marginLevel = margin > 0 ? ((equity / margin) * 100).toFixed(1) : '0.0';

  const gainers = [...marketData].sort((a, b) => b.change_percent_24h - a.change_percent_24h).slice(0, 3);
  const losers = [...marketData].sort((a, b) => a.change_percent_24h - b.change_percent_24h).slice(0, 3);

  return (
    <div className="p-6 space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Balance', value: `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'emerald', change: '' },
          { label: 'Equity', value: `$${equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: Activity, color: openPnL >= 0 ? 'emerald' : 'red', change: `${openPnL >= 0 ? '+' : ''}$${openPnL.toFixed(2)}` },
          { label: 'Free Margin', value: `$${freeMargin.toFixed(2)}`, icon: BarChart2, color: 'blue', change: '' },
          { label: 'Margin Level', value: `${marginLevel}%`, icon: TrendingUp, color: 'amber', change: '' },
        ].map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm">{card.label}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${card.color}-500/10`}>
                  <Icon size={16} className={`text-${card.color}-400`} />
                </div>
              </div>
              <div className="text-white text-xl font-bold">{card.value}</div>
              {card.change && (
                <div className={`text-sm mt-1 ${openPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{card.change}</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Watchlist */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-semibold">Watchlist</h2>
            <button onClick={() => onNavigate('markets')} className="text-emerald-400 text-sm hover:text-emerald-300 transition-colors">
              All markets
            </button>
          </div>
          <div className="space-y-2">
            {WATCHLIST.map(sym => (
              <WatchlistItem key={sym} symbol={sym} onTrade={() => onNavigate('trading')} />
            ))}
          </div>
        </div>

        {/* Movers */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-5">Market Movers</h2>
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <ArrowUpRight size={14} className="text-emerald-400" />
              <span className="text-emerald-400 text-xs font-medium uppercase tracking-wider">Top Gainers</span>
            </div>
            <div className="space-y-2">
              {gainers.map(item => (
                <div key={item.symbol} className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">{item.symbol}</span>
                  <span className="text-emerald-400 text-sm font-medium">+{item.change_percent_24h.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-800 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <ArrowDownRight size={14} className="text-red-400" />
              <span className="text-red-400 text-xs font-medium uppercase tracking-wider">Top Losers</span>
            </div>
            <div className="space-y-2">
              {losers.map(item => (
                <div key={item.symbol} className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">{item.symbol}</span>
                  <span className="text-red-400 text-sm font-medium">{item.change_percent_24h.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Open positions */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold">Open Positions ({positions.length})</h2>
          <button onClick={() => onNavigate('trading')} className="text-emerald-400 text-sm hover:text-emerald-300 transition-colors">
            New trade
          </button>
        </div>
        {positions.length === 0 ? (
          <div className="text-center py-10">
            <TrendingUp size={32} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No open positions</p>
            <button onClick={() => onNavigate('trading')} className="mt-3 text-emerald-400 text-sm hover:text-emerald-300 transition-colors">
              Start trading
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs border-b border-gray-800">
                  {['Symbol', 'Direction', 'Lots', 'Open Price', 'Current', 'P&L', 'Margin'].map(h => (
                    <th key={h} className="text-left pb-3 pr-4 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {positions.map(pos => {
                  const pnl = pos.profit_loss ?? 0;
                  return (
                    <tr key={pos.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-3 pr-4 text-white font-medium">{pos.symbol}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${pos.direction === 'buy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {pos.direction.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-gray-300">{pos.lot_size}</td>
                      <td className="py-3 pr-4 text-gray-300 font-mono">{pos.open_price.toFixed(5)}</td>
                      <td className="py-3 pr-4 text-gray-300 font-mono">{(pos.current_price || pos.open_price).toFixed(5)}</td>
                      <td className={`py-3 pr-4 font-medium ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                      </td>
                      <td className="py-3 text-gray-300">${(pos.margin_used ?? 0).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
