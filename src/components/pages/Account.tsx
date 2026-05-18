import { useState } from 'react';
import { User, Shield, Bell, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Profile } from '../../types';

interface AccountProps {
  profile: Profile | null;
  onRefresh: () => void;
}

const COUNTRIES = ['United States', 'United Kingdom', 'Germany', 'France', 'Japan', 'Australia', 'Canada', 'Singapore', 'UAE', 'South Africa', 'Brazil', 'India', 'Other'];
const LEVERAGES = [50, 100, 200, 500, 1000];

export function Account({ profile, onRefresh }: AccountProps) {
  const [tab, setTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [country, setCountry] = useState(profile?.country ?? '');
  const [leverage, setLeverage] = useState(profile?.leverage ?? 100);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function saveProfile() {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      full_name: fullName,
      phone,
      country,
      leverage,
      updated_at: new Date().toISOString(),
    }).eq('id', profile.id);
    setSaving(false);
    if (error) setMsg({ type: 'error', text: 'Failed to save' });
    else { setMsg({ type: 'success', text: 'Profile updated' }); onRefresh(); }
    setTimeout(() => setMsg(null), 3000);
  }

  const verificationSteps = [
    { label: 'Email Verified', done: true },
    { label: 'Phone Verified', done: !!profile?.phone },
    { label: 'Identity Verified', done: profile?.verification_status === 'verified' },
    { label: 'Address Verified', done: false },
  ];

  const accountTypeInfo: Record<string, { color: string; features: string[] }> = {
    standard: { color: 'emerald', features: ['Floating spreads from 0.3 pips', 'No commission', 'Max leverage 1:2000'] },
    pro: { color: 'blue', features: ['Spreads from 0.1 pips', '$3.5/lot commission', 'Max leverage 1:2000'] },
    raw: { color: 'amber', features: ['Raw spreads from 0.0 pips', '$7/lot commission', 'Max leverage 1:2000'] },
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full flex items-center justify-center text-2xl font-bold text-emerald-400">
            {profile?.full_name?.slice(0, 2).toUpperCase() || profile?.email?.slice(0, 2).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-white text-xl font-bold">{profile?.full_name || 'Trader'}</h2>
            <p className="text-gray-400 text-sm">{profile?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize`}>
                {profile?.account_type ?? 'standard'} Account
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full ${
                profile?.verification_status === 'verified' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              } capitalize`}>
                {profile?.verification_status ?? 'unverified'}
              </span>
            </div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-gray-400 text-sm">Balance</div>
            <div className="text-white text-2xl font-bold">${(profile?.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit gap-1">
        {([
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'security', label: 'Verification', icon: Shield },
          { id: 'notifications', label: 'Account Type', icon: CreditCard },
        ] as const).map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'profile' && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-6">Personal Information</h3>
          {msg && (
            <div className={`mb-4 flex items-center gap-2 p-3 rounded-xl text-sm border ${msg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
              {msg.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
              {msg.text}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-gray-400 text-xs mb-1.5 block">Full Name</label>
              <input
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1.5 block">Email</label>
              <input
                value={profile?.email ?? ''}
                disabled
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1.5 block">Phone Number</label>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1 234 567 8900"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder-gray-600"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1.5 block">Country</label>
              <select
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="">Select country</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1.5 block">Default Leverage</label>
              <select
                value={leverage}
                onChange={e => setLeverage(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              >
                {LEVERAGES.map(l => <option key={l} value={l}>1:{l}</option>)}
              </select>
            </div>
          </div>
          <button
            onClick={saveProfile}
            disabled={saving}
            className="mt-6 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {tab === 'security' && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-6">Verification Status</h3>
          <div className="space-y-4">
            {verificationSteps.map((step, i) => (
              <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border ${step.done ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-gray-800/50 border-gray-700/50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700 text-gray-500'}`}>
                  {step.done ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                </div>
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">{step.label}</div>
                  <div className={`text-xs mt-0.5 ${step.done ? 'text-emerald-400' : 'text-gray-500'}`}>
                    {step.done ? 'Verified' : 'Pending verification'}
                  </div>
                </div>
                {!step.done && (
                  <button className="text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-lg transition-colors">
                    Verify
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <Bell size={16} className="text-blue-400 mt-0.5" />
              <div>
                <div className="text-blue-400 text-sm font-medium">Why verify?</div>
                <div className="text-gray-400 text-xs mt-1">Verification increases withdrawal limits, unlocks higher leverage, and provides access to exclusive features and account types.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(accountTypeInfo).map(([type, info]) => {
            const isCurrent = profile?.account_type === type;
            return (
              <div key={type} className={`bg-gray-900 border rounded-2xl p-6 ${isCurrent ? `border-${info.color}-500/40` : 'border-gray-800'}`}>
                {isCurrent && (
                  <div className={`text-xs font-medium text-${info.color}-400 bg-${info.color}-500/10 border border-${info.color}-500/20 px-2.5 py-1 rounded-full inline-block mb-3`}>
                    Current
                  </div>
                )}
                <h4 className="text-white font-bold text-lg capitalize mb-3">{type}</h4>
                <ul className="space-y-2.5">
                  {info.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-gray-400 text-sm">
                      <CheckCircle size={14} className={`text-${info.color}-400 mt-0.5 flex-shrink-0`} />
                      {f}
                    </li>
                  ))}
                </ul>
                {!isCurrent && (
                  <button className={`mt-5 w-full border border-${info.color}-500/30 text-${info.color}-400 hover:bg-${info.color}-500/10 py-2.5 rounded-xl text-sm font-medium transition-colors`}>
                    Switch Account
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
