import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, X, ChevronDown } from 'lucide-react';
import { useMarketData } from '../../hooks/useMarketData';
import type { Position, Profile } from '../../types';

const SYMBOLS = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD',
  'BTCUSD', 'ETHUSD', 'XAUUSD', 'US500', 'US100',
];

interface TradingProps {
  profile: Profile | null;
  positions: Position[];
  selectedSymbol?: string;
  onOpenPosition: (params: {
    userId: string; symbol: string; instrumentId: string;
    direction: 'buy' | 'sell'; lotSize: number; openPrice: number;
    takeProfit?: number; stopLoss?: number; leverage: number;
  }) => Promise<{ error: unknown }>;
  onClosePosition: (position: Position, closePrice: number, userId: string) => Promise<{ error: unknown; pnl: number }>;
}

function PriceChart({ symbol }: { symbol: string }) {
  const { priceHistory } = useMarketData(symbol);
  if (priceHistory.length < 2) return <div className="h-full bg-gray-800/30 rounded-lg animate-pulse" />;

  const prices = priceHistory.slice(-60);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const w = 600;
  const h = 200;

  const points = prices.map((p, i) => {
    const x = (i / (prices.length - 1)) * w;
    const y = h - ((p - min) / range) * h * 0.8 - h * 0.1;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${h} ${points} ${w},${h}`;
  const isUp = prices[prices.length - 1] >= prices[0];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isUp ? '#10b981' : '#ef4444'} stopOpacity="0.15" />
          <stop offset="100%" stopColor={isUp ? '#10b981' : '#ef4444'} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#chartGrad)" />
      <polyline points={points} fill="none" stroke={isUp ? '#10b981' : '#ef4444'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Trading({ profile, positions, selectedSymbol, onOpenPosition, onClosePosition }: TradingProps) {
  const [symbol, setSymbol] = useState(selectedSymbol ?? 'EURUSD');
  const [lotSize, setLotSize] = useState('0.01');
  const [takeProfit, setTakeProfit] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showSymbolPicker, setShowSymbolPicker] = useState(false);
  const { current } = useMarketData(symbol);

  useEffect(() => {
    if (selectedSymbol) setSymbol(selectedSymbol);
  }, [selectedSymbol]);

  function formatPrice(price: number) {
    if (['BTCUSD', 'US500', 'US100', 'US30', 'GER40', 'UK100'].includes(symbol)) return price.toFixed(2);
    if (['USDJPY', 'EURJPY', 'GBPJPY', 'AUDJPY'].includes(symbol)) return price.toFixed(3);
    return price.toFixed(5);
  }

  async function handleTrade(direction: 'buy' | 'sell') {
    if (!profile || !current) return;
    const lot = parseFloat(lotSize);
    if (isNaN(lot) || lot <= 0) { setMessage({ type: 'error', text: 'Invalid lot size' }); return; }
    if (lot < 0.01) { setMessage({ type: 'error', text: 'Minimum lot size is 0.01' }); return; }

    setLoading(true);
    setMessage(null);

    const price = direction === 'buy' ? current.ask : current.bid;
    const { error } = await onOpenPosition({
      userId: profile.id,
      symbol,
      instrumentId: '00000000-0000-0000-0000-000000000001',
      direction,
      lotSize: lot,
      openPrice: price,
      takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
      stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
      leverage: profile.leverage ?? 100,
    });

    setLoading(false);
    if (error) {
      setMessage({ type: 'error', text: 'Failed to open position' });
    } else {
      setMessage({ type: 'success', text: `${direction.toUpperCase()} ${lot} lots ${symbol} @ ${formatPrice(price)}` });
      setTimeout(() => setMessage(null), 3000);
    }
  }

  async function handleClose(position: Position) {
    if (!profile || !current) return;
    const closePrice = position.direction === 'buy' ? current.bid : current.ask;
    const { pnl } = await onClosePosition(position, closePrice, profile.id);
    setMessage({
      type: pnl >= 0 ? 'success' : 'error',
      text: `Position closed. P&L: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`,
    });
    setTimeout(() => setMessage(null), 3000);
  }

  const openPnL = positions.reduce((s, p) => s + (p.profit_loss ?? 0), 0);

  return (
    <div className="p-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Chart */}
      <div className="xl:col-span-2 space-y-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="relative">
              <button
                onClick={() => setShowSymbolPicker(!showSymbolPicker)}
                className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white font-medium hover:border-gray-600 transition-colors"
              >
                {symbol}
                <ChevronDown size={14} className="text-gray-400" />
              </button>
              {showSymbolPicker && (
                <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 py-2 min-w-36">
                  {SYMBOLS.map(s => (
                    <button
                      key={s}
                      onClick={() => { setSymbol(s); setShowSymbolPicker(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${s === symbol ? 'text-emerald-400' : 'text-gray-300'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {current && (
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <div className="text-gray-500 text-xs">Bid</div>
                  <div className="text-white font-mono">{formatPrice(current.bid)}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Ask</div>
                  <div className="text-white font-mono">{formatPrice(current.ask)}</div>
                </div>
                <div className={`flex items-center gap-1 ${current.change_percent_24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {current.change_percent_24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span>{current.change_percent_24h >= 0 ? '+' : ''}{current.change_percent_24h.toFixed(2)}%</span>
                </div>
              </div>
            )}
          </div>
          <div className="h-52">
            <PriceChart symbol={symbol} />
          </div>
          {current && (
            <div className="flex gap-6 mt-4 pt-4 border-t border-gray-800">
              {[
                { label: 'High', value: formatPrice(current.high_24h) },
                { label: 'Low', value: formatPrice(current.low_24h) },
                { label: 'Change', value: `${current.change_percent_24h >= 0 ? '+' : ''}${current.change_percent_24h.toFixed(3)}%` },
              ].map(s => (
                <div key={s.label}>
                  <div className="text-gray-500 text-xs">{s.label}</div>
                  <div className="text-white text-sm font-mono mt-0.5">{s.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Open positions */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Open Positions</h3>
            <span className={`text-sm font-medium ${openPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              Total P&L: {openPnL >= 0 ? '+' : ''}${openPnL.toFixed(2)}
            </span>
          </div>
          {positions.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">No open positions</p>
          ) : (
            <div className="space-y-2">
              {positions.map(pos => {
                const pnl = pos.profit_loss ?? 0;
                return (
                  <div key={pos.id} className="flex items-center justify-between bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${pos.direction === 'buy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {pos.direction.toUpperCase()}
                      </span>
                      <div>
                        <div className="text-white text-sm font-medium">{pos.symbol}</div>
                        <div className="text-gray-500 text-xs">{pos.lot_size} lots @ {pos.open_price.toFixed(5)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleClose(pos)}
                        className="w-7 h-7 bg-gray-700 hover:bg-red-500/20 hover:text-red-400 rounded-lg flex items-center justify-center text-gray-400 transition-colors"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Order form */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 h-fit">
        <h3 className="text-white font-semibold mb-5">New Order</h3>
        {message && (
          <div className={`mb-4 p-3 rounded-xl text-sm border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-xs mb-1.5 block">Instrument</label>
            <div className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white font-medium">{symbol}</div>
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1.5 block">Lot Size</label>
            <input
              type="number"
              value={lotSize}
              onChange={e => setLotSize(e.target.value)}
              step="0.01"
              min="0.01"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <div className="flex gap-2 mt-2">
              {['0.01', '0.10', '1.00'].map(v => (
                <button
                  key={v}
                  onClick={() => setLotSize(v)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg py-1.5 text-gray-400 hover:text-white text-xs transition-colors"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-xs mb-1.5 block">Take Profit</label>
              <input
                type="number"
                value={takeProfit}
                onChange={e => setTakeProfit(e.target.value)}
                placeholder="Optional"
                step="0.00001"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-emerald-500 text-sm transition-colors placeholder-gray-600"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1.5 block">Stop Loss</label>
              <input
                type="number"
                value={stopLoss}
                onChange={e => setStopLoss(e.target.value)}
                placeholder="Optional"
                step="0.00001"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-emerald-500 text-sm transition-colors placeholder-gray-600"
              />
            </div>
          </div>

          {current && (
            <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50 text-sm">
              <div className="flex justify-between mb-1.5">
                <span className="text-gray-500">Margin required</span>
                <span className="text-white">${((parseFloat(lotSize) || 0) * 100000 * current.last_price / (profile?.leverage ?? 100)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Spread</span>
                <span className="text-white">{((current.ask - current.bid) * 100000).toFixed(1)} pips</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => handleTrade('buy')}
              disabled={loading || !current}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors"
            >
              <div className="text-xs opacity-75 mb-0.5">BUY</div>
              <div className="text-sm font-mono">{current ? formatPrice(current.ask) : '—'}</div>
            </button>
            <button
              onClick={() => handleTrade('sell')}
              disabled={loading || !current}
              className="bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors"
            >
              <div className="text-xs opacity-75 mb-0.5">SELL</div>
              <div className="text-sm font-mono">{current ? formatPrice(current.bid) : '—'}</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
