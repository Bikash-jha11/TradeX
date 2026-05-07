import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

const Card = ({ title, items }:any) => (
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
    <div className="min-h-screen bg-[#0B0F19] p-6 text-white">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card title="New" items={sample} />
        <Card title="Top Movers" items={sample} />
        <Card title="Popular" items={sample} />
      </div>
    </div>
  );
}
