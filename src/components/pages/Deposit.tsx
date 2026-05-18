import { useState } from 'react';
import { CreditCard, Building2, Smartphone, ArrowDownLeft, ArrowUpRight, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Profile } from '../../types';

interface DepositProps {
  profile: Profile | null;
  onRefresh: () => void;
}

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard, fee: '1.5%', time: 'Instant' },
  { id: 'bank', label: 'Bank Wire Transfer', icon: Building2, fee: 'Free', time: '1-3 days' },
  { id: 'crypto', label: 'Cryptocurrency', icon: Smartphone, fee: '0.5%', time: '10-30 min' },
];

const AMOUNTS = [100, 500, 1000, 5000, 10000];

export function Deposit({ profile, onRefresh }: DepositProps) {
  const [tab, setTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [method, setMethod] = useState('card');
  const [amount, setAmount] = useState('1000');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { setError('Invalid amount'); return; }
    if (tab === 'withdraw' && amt > (profile.balance ?? 0)) { setError('Insufficient balance'); return; }

    setLoading(true);
    setError('');

    await new Promise(r => setTimeout(r, 1500));

    const newBalance = tab === 'deposit' ? (profile.balance ?? 0) + amt : (profile.balance ?? 0) - amt;

    const { error: dbErr } = await supabase.from('profiles').update({ balance: newBalance, equity: newBalance }).eq('id', profile.id);
    if (!dbErr) {
      await supabase.from('transactions').insert({
        user_id: profile.id,
        type: tab === 'deposit' ? 'deposit' : 'withdrawal',
        amount: tab === 'deposit' ? amt : -amt,
        balance_after: newBalance,
        description: `${tab === 'deposit' ? 'Deposit' : 'Withdrawal'} via ${PAYMENT_METHODS.find(m => m.id === method)?.label}`,
        status: 'completed',
      });
      setSuccess(`${tab === 'deposit' ? 'Deposit' : 'Withdrawal'} of $${amt.toLocaleString()} processed successfully!`);
      onRefresh();
    } else {
      setError('Transaction failed. Please try again.');
    }
    setLoading(false);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Balance card */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-gray-400 text-sm mb-1">Available Balance</div>
            <div className="text-white text-3xl font-bold">${(profile?.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setTab('deposit')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${tab === 'deposit' ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'}`}
            >
              <ArrowDownLeft size={15} />
              Deposit
            </button>
            <button
              onClick={() => setTab('withdraw')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${tab === 'withdraw' ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'}`}
            >
              <ArrowUpRight size={15} />
              Withdraw
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-5 capitalize">{tab} Funds</h3>

          {success ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-emerald-400" />
              </div>
              <p className="text-emerald-400 font-medium">{success}</p>
              <button onClick={() => setSuccess('')} className="mt-4 text-gray-400 text-sm hover:text-white transition-colors">
                Make another transaction
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Payment methods */}
              <div>
                <label className="text-gray-400 text-xs mb-3 block">Payment Method</label>
                <div className="space-y-2">
                  {PAYMENT_METHODS.map(m => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMethod(m.id)}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${method === m.id ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'}`}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${method === m.id ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700 text-gray-400'}`}>
                          <Icon size={17} />
                        </div>
                        <div className="text-left flex-1">
                          <div className="text-white text-sm font-medium">{m.label}</div>
                          <div className="text-gray-500 text-xs">Fee: {m.fee} · {m.time}</div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${method === m.id ? 'border-emerald-500 bg-emerald-500' : 'border-gray-600'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="text-gray-400 text-xs mb-2 block">Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    min="1"
                    step="1"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-8 pr-4 py-3.5 text-white focus:outline-none focus:border-emerald-500 transition-colors text-lg font-medium"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {AMOUNTS.map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAmount(a.toString())}
                      className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg py-1.5 text-gray-400 hover:text-white text-xs transition-colors"
                    >
                      ${a >= 1000 ? `${a / 1000}K` : a}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-3">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className={`w-full font-semibold py-4 rounded-xl transition-colors disabled:opacity-50 ${tab === 'deposit' ? 'bg-emerald-500 hover:bg-emerald-400 text-white' : 'bg-red-500 hover:bg-red-400 text-white'}`}
              >
                {loading ? 'Processing...' : `${tab === 'deposit' ? 'Deposit' : 'Withdraw'} $${parseFloat(amount || '0').toLocaleString()}`}
              </button>
            </form>
          )}
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h4 className="text-white font-semibold mb-4">Transaction Limits</h4>
            <div className="space-y-3">
              {[
                { label: 'Min Deposit', value: '$10' },
                { label: 'Max Deposit', value: '$100,000' },
                { label: 'Min Withdrawal', value: '$10' },
                { label: 'Max Withdrawal', value: '$50,000/day' },
              ].map(item => (
                <div key={item.label} className="flex justify-between">
                  <span className="text-gray-400 text-sm">{item.label}</span>
                  <span className="text-white text-sm font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h4 className="text-white font-semibold mb-4">Security Notice</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              All transactions are protected with 256-bit SSL encryption. Withdrawals are processed within 1-3 business days after identity verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
