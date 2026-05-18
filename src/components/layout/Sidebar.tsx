import { LayoutDashboard, TrendingUp, BarChart2, Clock, User, LogOut, CreditCard, ChevronRight } from 'lucide-react';
import type { Page } from '../../types';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onSignOut: () => void;
  balance: number;
  equity: number;
}

const navItems: { id: Page; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'markets', label: 'Markets', icon: BarChart2 },
  { id: 'trading', label: 'Trading', icon: TrendingUp },
  { id: 'history', label: 'History', icon: Clock },
  { id: 'deposit', label: 'Deposit / Withdraw', icon: CreditCard },
  { id: 'account', label: 'Account', icon: User },
];

export function Sidebar({ currentPage, onNavigate, onSignOut, balance, equity }: SidebarProps) {
  const pnl = equity - balance;
  const pnlPercent = balance > 0 ? ((pnl / balance) * 100).toFixed(2) : '0.00';

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
            <TrendingUp size={18} className="text-white" />
          </div>
          <span className="text-white text-xl font-bold tracking-tight">TradeX</span>
        </div>
      </div>

      {/* Balance card */}
      <div className="mx-4 mt-4 p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-xl border border-emerald-500/20">
        <div className="text-gray-400 text-xs mb-1">Account Balance</div>
        <div className="text-white text-xl font-bold">${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        <div className="flex items-center gap-2 mt-2">
          <div className="text-gray-400 text-xs">Equity</div>
          <div className="text-white text-xs font-medium">${equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className={`text-xs font-medium ml-auto ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} ({pnl >= 0 ? '+' : ''}{pnlPercent}%)
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                active
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon size={18} />
              <span className="flex-1 text-left">{item.label}</span>
              {active && <ChevronRight size={14} className="text-emerald-400" />}
            </button>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
