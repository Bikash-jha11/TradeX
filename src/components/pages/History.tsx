import { useState } from 'react';
import { Clock, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import type { Order, Transaction } from '../../types';

interface HistoryProps {
  orders: Order[];
  transactions: Transaction[];
}

export function History({ orders, transactions }: HistoryProps) {
  const [tab, setTab] = useState<'trades' | 'transactions'>('trades');

  const totalPnl = orders.filter(o => o.status === 'filled').reduce((s, o) => s + (o.profit_loss ?? 0), 0);
  const winTrades = orders.filter(o => (o.profit_loss ?? 0) > 0).length;
  const winRate = orders.length > 0 ? ((winTrades / orders.length) * 100).toFixed(1) : '0.0';

  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Trades', value: orders.length.toString(), icon: Clock, color: 'blue' },
          { label: 'Total P&L', value: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`, icon: DollarSign, color: totalPnl >= 0 ? 'emerald' : 'red' },
          { label: 'Win Rate', value: `${winRate}%`, icon: TrendingUp, color: 'emerald' },
          { label: 'Transactions', value: transactions.length.toString(), icon: DollarSign, color: 'amber' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">{s.label}</span>
                <Icon size={16} className={`text-${s.color}-400`} />
              </div>
              <div className={`text-xl font-bold ${s.label === 'Total P&L' ? (totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400') : 'text-white'}`}>
                {s.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="flex border-b border-gray-800">
          {(['trades', 'transactions'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-4 text-sm font-medium capitalize transition-colors ${tab === t ? 'text-white border-b-2 border-emerald-500' : 'text-gray-400 hover:text-white'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'trades' && (
          <div className="overflow-x-auto">
            {orders.length === 0 ? (
              <div className="text-center py-16">
                <Clock size={32} className="text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500">No trade history yet</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    {['Symbol', 'Direction', 'Lots', 'Open', 'Close', 'P&L', 'Status', 'Date'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-gray-500 text-xs font-medium uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {orders.map(order => {
                    const pnl = order.profit_loss ?? 0;
                    return (
                      <tr key={order.id} className="hover:bg-gray-800/30">
                        <td className="px-5 py-4 text-white font-medium text-sm">{order.symbol}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${order.direction === 'buy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                            {order.direction.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-300 text-sm">{order.lot_size}</td>
                        <td className="px-5 py-4 text-gray-300 text-sm font-mono">{order.open_price.toFixed(5)}</td>
                        <td className="px-5 py-4 text-gray-300 text-sm font-mono">{order.close_price?.toFixed(5) ?? '—'}</td>
                        <td className={`px-5 py-4 text-sm font-medium ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          <div className="flex items-center gap-1">
                            {pnl >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            order.status === 'filled' ? 'bg-emerald-500/10 text-emerald-400' :
                            order.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-red-500/10 text-red-400'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-500 text-xs">
                          {new Date(order.opened_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 'transactions' && (
          <div className="overflow-x-auto">
            {transactions.length === 0 ? (
              <div className="text-center py-16">
                <DollarSign size={32} className="text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500">No transactions yet</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    {['Type', 'Amount', 'Balance After', 'Description', 'Status', 'Date'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-gray-500 text-xs font-medium uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {transactions.map(tx => {
                    const isPositive = tx.amount >= 0;
                    const typeColors: Record<string, string> = {
                      deposit: 'bg-emerald-500/10 text-emerald-400',
                      withdrawal: 'bg-red-500/10 text-red-400',
                      trade_profit: 'bg-emerald-500/10 text-emerald-400',
                      trade_loss: 'bg-red-500/10 text-red-400',
                      commission: 'bg-gray-500/10 text-gray-400',
                      bonus: 'bg-amber-500/10 text-amber-400',
                    };
                    return (
                      <tr key={tx.id} className="hover:bg-gray-800/30">
                        <td className="px-5 py-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${typeColors[tx.type] ?? 'bg-gray-500/10 text-gray-400'}`}>
                            {tx.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className={`px-5 py-4 text-sm font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isPositive ? '+' : ''}${tx.amount.toFixed(2)}
                        </td>
                        <td className="px-5 py-4 text-gray-300 text-sm">${(tx.balance_after ?? 0).toFixed(2)}</td>
                        <td className="px-5 py-4 text-gray-400 text-sm truncate max-w-48">{tx.description || '—'}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-0.5 rounded text-xs ${tx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-500 text-xs">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
