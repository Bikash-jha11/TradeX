import React, { useState, useEffect, useMemo } from 'react';

// --- Types & Mock Logic ---

interface OrderLevel {
  price: number;
  size: number;
  total: number;
}

const generateData = (midPrice: number, step: number, side: 'bid' | 'ask'): OrderLevel[] => {
  let cumulative = 0;
  return Array.from({ length: 12 }).map((_, i) => {
    const price = side === 'ask' ? midPrice + (i + 1) * step : midPrice - (i + 1) * step;
    const size = Math.random() * 25000 + 100;
    cumulative += size;
    return { price, size, total: cumulative };
  });
};

// --- Sub-Components ---

const OrderRow = ({ data, type, maxTotal }: { data: OrderLevel; type: 'bid' | 'ask'; maxTotal: number }) => {
  const depthWidth = (data.total / maxTotal) * 100;
  
  // Format numbers to match image (K for thousands)
  const formatSize = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
    return num.toFixed(2);
  };

  return (
    <div className="relative flex justify-between px-4 py-[1.5px] text-[11px] font-mono transition-colors hover:bg-white/5 cursor-pointer group">
      {/* Depth Bar Background */}
      <div 
        className={`absolute right-0 top-0 bottom-0 transition-all duration-500 ${
          type === 'bid' ? 'bg-[#00b15d]/15' : 'bg-[#ff3b69]/15'
        }`}
        style={{ width: `${depthWidth}%`, zIndex: 0 }}
      />

      <span className={`z-10 w-1/3 text-left ${type === 'bid' ? 'text-[#00b15d]' : 'text-[#ff3b69]'}`}>
        {data.price.toFixed(5)}
      </span>
      <span className="z-10 w-1/3 text-right text-[#b7bdc6] group-hover:text-white">
        {formatSize(data.size)}
      </span>
      <span className="z-10 w-1/3 text-right text-[#eaecef]">
        {formatSize(data.total)}
      </span>
    </div>
  );
};

// --- Main Component ---

export default function UnifiedOrderBook() {
  const [midPrice] = useState(0.12672);
  const [data, setData] = useState({
    asks: generateData(0.12672, 0.00003, 'ask'),
    bids: generateData(0.12672, 0.00003, 'bid'),
  });

  // Simulating live B+ Tree / Kafka updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData({
        asks: generateData(0.12672, 0.00003, 'ask'),
        bids: generateData(0.12672, 0.00003, 'bid'),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const maxTotal = useMemo(() => {
    const askMax = data.asks[data.asks.length - 1]?.total || 0;
    const bidMax = data.bids[data.bids.length - 1]?.total || 0;
    return Math.max(askMax, bidMax);
  }, [data]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#050505]">
      <div className="w-[320px] bg-[#12151a] border border-white/10 rounded-lg overflow-hidden shadow-2xl">
        
        {/* Top Header/Tools (Visual only) */}
        <div className="flex justify-between items-center px-4 py-2 border-b border-white/5 bg-white/[0.02]">
           <div className="flex gap-2 text-gray-500">
             <span className="cursor-pointer hover:text-white">☰</span>
             <span className="cursor-pointer hover:text-white">📊</span>
           </div>
           <div className="text-white text-xs font-bold flex items-center gap-1">
             0.00001 <span className="text-gray-500">+</span>
           </div>
        </div>

        {/* Labels */}
        <div className="flex justify-between px-4 py-2 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
          <span>Price (USD)</span>
          <span>Size (MEGA)</span>
          <span>Total (MEGA)</span>
        </div>

        {/* Asks (Sellers) - Reversed so lowest price is near mid */}
        <div className="flex flex-col-reverse">
          {data.asks.map((ask, i) => (
            <OrderRow key={`ask-${i}`} data={ask} type="ask" maxTotal={maxTotal} />
          ))}
        </div>

        {/* Mid-Price Spread Display */}
        <div className="px-4 py-3 flex items-baseline gap-2 bg-white/[0.01]">
          <span className="text-xl font-bold text-[#00b15d]">{midPrice.toFixed(5)}</span>
          <span className="text-xs text-gray-500">0.12662</span>
          <span className="ml-auto text-[10px] text-blue-400 font-bold uppercase cursor-pointer hover:underline">
            Recenter
          </span>
        </div>

        {/* Bids (Buyers) */}
        <div className="flex flex-col">
          {data.bids.map((bid, i) => (
            <OrderRow key={`bid-${i}`} data={bid} type="bid" maxTotal={maxTotal} />
          ))}
        </div>
      </div>
    </div>
  );
}