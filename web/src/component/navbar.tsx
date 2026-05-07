import React from "react";
import { Bell, Settings, User } from "lucide-react";
import { AiFillFire } from "react-icons/ai";

export default function Navbar() {
  return (
    <nav className="w-full bg-[#0B0F19] border-b border-gray-800 px-4 py-2 flex items-center justify-between">
      
      <div className="w-[50%] flex items-center gap-12">
      {/* Left - Logo */}
      <div className="flex items-center gap-3">
        <AiFillFire className="w-8 h-8" style={{ color: "red" }} />
        <h1 className="text-white font-semibold text-lg">TradeX</h1>
      </div>

      {/* Center - Links */}
      <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
        <a href="#" className="hover:text-white transition">Markets</a>
        <a href="#" className="hover:text-white transition">Trade</a>
        <a href="#" className="hover:text-white transition">Futures</a>
        <a href="#" className="hover:text-white transition">Earn</a>
      </div>


</div>
      {/* Right - Actions */}
      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-white">
          <Bell size={18} />
        </button>
        <button className="text-gray-400 hover:text-white">
          <Settings size={18} />
        </button>
        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
          <User size={16} className="text-gray-300" />
        </div>
      </div>
    </nav>
  );
}