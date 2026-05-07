import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

const Card = ({ title, items }) => (
  <div className="bg-[#111827] rounded-2xl p-5 shadow-lg w-full">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-white font-semibold">{title}</h3>
      <span className="text-gray-400 text-sm">24h Change</span>
    </div>
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={idx} className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-gray-700" />
            <span className="text-gray-200 text-sm">{item.name}</span>
          </div>
          <div className="text-right">
            <p className="text-white text-sm">{item.price}</p>
            <p className={`text-xs ${item.change > 0 ? "text-green-400" : "text-red-400"}`}>
              {item.change > 0 ? "+" : ""}{item.change}%
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function Dashboard() {
  const sample = [
    { name: "MEGA-PERP", price: "$0.12638", change: -1.89 },
    { name: "EDGE-PERP", price: "$1.31", change: 0.76 },
    { name: "BP/USD", price: "$0.14686", change: -2.86 },
    { name: "ZEC/USD", price: "$526.74", change: 23.21 },
    { name: "PAXG/USD", price: "$4,639.70", change: 2.44 },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] p-6 text-white space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#111827] to-[#0B0F19] rounded-2xl p-8 flex justify-between items-center shadow-lg">
        <div>
          <h1 className="text-2xl font-bold mb-2">
            Lend USD. Earn <span className="text-green-400">3.93% - 6.93%</span> APY
          </h1>
          <p className="text-gray-400 mb-4">
            Lend USD to start earning high yield while using as collateral for trading.
          </p>
          <button className="bg-green-500 hover:bg-green-600 px-5 py-2 rounded-xl font-medium">
            Lend USD
          </button>
        </div>

        <div className="flex items-center gap-4 text-gray-400">
          <ArrowLeft />
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center text-4xl font-bold text-green-400">
            $
          </div>
          <ArrowRight />
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="New" items={sample} />
        <Card title="Top Movers" items={sample} />
        <Card title="Popular" items={sample} />
      </div>

      {/* Trading Panel */}
      <div className="max-w-sm bg-[#111827] rounded-2xl p-5 shadow-lg">
        {/* Tabs */}
        <div className="flex bg-[#0B0F19] rounded-xl p-1 mb-4">
          <button className="flex-1 py-2 rounded-lg bg-green-500/20 text-green-400 font-medium">
            Buy / Long
          </button>
          <button className="flex-1 py-2 rounded-lg text-gray-400">
            Sell / Short
          </button>
        </div>

        {/* Order Type */}
        <div className="flex gap-4 text-sm text-gray-400 mb-4">
          <span className="text-white">Limit</span>
          <span>Market</span>
          <span>Conditional</span>
        </div>

        {/* Available */}
        <div className="flex justify-between text-sm text-gray-400 mb-3">
          <span>Available Equity</span>
          <span>$0.00</span>
        </div>

        {/* Input */}
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400">Price</label>
            <div className="mt-1 flex items-center justify-between bg-[#0B0F19] rounded-xl px-3 py-3">
              <input className="bg-transparent outline-none text-white w-full" defaultValue="0.12635" />
              <span className="ml-2 bg-green-500/20 text-green-400 px-2 py-1 rounded">$</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400">Quantity</label>
            <div className="mt-1 flex items-center justify-between bg-[#0B0F19] rounded-xl px-3 py-3">
              <input className="bg-transparent outline-none text-white w-full" defaultValue="1,200" />
              <span className="ml-2 bg-gray-700 text-gray-300 px-2 py-1 rounded">M</span>
            </div>
          </div>

          {/* Slider */}
          <input type="range" className="w-full" />

          <div>
            <label className="text-xs text-gray-400">Order Value</label>
            <div className="mt-1 flex items-center justify-between bg-[#0B0F19] rounded-xl px-3 py-3">
              <input className="bg-transparent outline-none text-white w-full" defaultValue="151.62" />
              <span className="ml-2 bg-green-500/20 text-green-400 px-2 py-1 rounded">$</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 space-y-3">
          <button className="w-full bg-gray-200 text-black py-3 rounded-xl font-medium">
            Sign up to trade
          </button>
          <button className="w-full bg-[#0B0F19] py-3 rounded-xl text-gray-300">
            Log in to trade
          </button>
        </div>
      </div>
    </div>
  );
}
