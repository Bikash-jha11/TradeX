import { TrendingUp, Shield, Zap, Globe, BarChart2, ArrowRight, CheckCircle } from 'lucide-react';
import { useMarketData } from '../../hooks/useMarketData';

interface LandingProps {
  onGetStarted: () => void;
}

function TickerItem({ symbol }: { symbol: string }) {
  const { current } = useMarketData(symbol);
  if (!current) return null;
  const isUp = current.change_percent_24h >= 0;
  const price = ['BTCUSD', 'US500'].includes(symbol) ? current.last_price.toFixed(2) : current.last_price.toFixed(5);
  return (
    <div className="flex items-center gap-3 px-6 py-3 border-r border-gray-800 flex-shrink-0">
      <span className="text-gray-300 text-sm font-medium">{symbol}</span>
      <span className="text-white text-sm font-mono">{price}</span>
      <span className={`text-xs font-medium ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
        {isUp ? '+' : ''}{current.change_percent_24h.toFixed(2)}%
      </span>
    </div>
  );
}

const TICKER_SYMBOLS = ['EURUSD', 'GBPUSD', 'USDJPY', 'BTCUSD', 'XAUUSD', 'US500', 'ETHUSD', 'AUDUSD'];

export function Landing({ onGetStarted }: LandingProps) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <TrendingUp size={16} className="text-white" />
            </div>
            <span className="text-white text-xl font-bold">TradeX</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Platforms', 'Markets', 'About', 'Promotions'].map(item => (
              <button key={item} className="text-gray-400 hover:text-white text-sm transition-colors">{item}</button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onGetStarted} className="text-gray-300 hover:text-white text-sm transition-colors">Sign In</button>
            <button onClick={onGetStarted} className="bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
              Open Account
            </button>
          </div>
        </div>
      </nav>

      {/* Live ticker */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-gray-900 border-b border-gray-800 overflow-hidden">
        <div className="flex animate-scroll-x">
          {[...TICKER_SYMBOLS, ...TICKER_SYMBOLS].map((sym, i) => (
            <TickerItem key={`${sym}-${i}`} symbol={sym} />
          ))}
        </div>
      </div>

      {/* Hero */}
      <section className="pt-40 pb-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-4 py-2 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Trusted by 800,000+ traders worldwide
          </div>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 tracking-tight">
            Trade the world's<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
              most popular markets
            </span>
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Access 2,000+ financial instruments with ultra-low spreads, industry-leading execution speeds, and advanced trading tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onGetStarted}
              className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
            >
              Start Trading <ArrowRight size={20} />
            </button>
            <button className="flex items-center justify-center gap-2 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-medium px-8 py-4 rounded-xl text-lg transition-colors">
              <BarChart2 size={20} />
              Try Demo Account
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-8 mt-12">
            {[
              { label: 'Minimum Deposit', value: '$1' },
              { label: 'Max Leverage', value: '1:2000' },
              { label: 'Execution Speed', value: '<25ms' },
              { label: 'Years of Experience', value: '14+' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-emerald-400 text-2xl font-bold">{s.value}</div>
                <div className="text-gray-500 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why choose TradeX?</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Built for professional traders and beginners alike</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: 'Ultra-fast Execution', desc: 'Market orders executed in under 25 milliseconds with zero requotes', color: 'amber' },
              { icon: Shield, title: 'Regulated & Secure', desc: 'Licensed by FCA, CySEC, FSCA, and FSA with segregated client funds', color: 'emerald' },
              { icon: Globe, title: '190+ Countries', desc: 'Trading services available to clients in over 190 countries globally', color: 'blue' },
              { icon: BarChart2, title: '2000+ Instruments', desc: 'Forex, crypto, commodities, indices, stocks, and ETFs', color: 'cyan' },
            ].map(f => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors">
                  <div className={`w-12 h-12 bg-${f.color}-500/10 rounded-xl flex items-center justify-center mb-4`}>
                    <Icon size={22} className={`text-${f.color}-400`} />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Account types */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Account Types</h2>
            <p className="text-gray-400 text-lg">Choose the account that fits your trading style</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Standard', minDeposit: '$1', spread: 'From 0.3 pips', commission: 'None', leverage: '1:2000', features: ['Floating spreads', 'No commission', 'All major instruments', 'MT4/MT5 supported'] },
              { name: 'Pro', minDeposit: '$200', spread: 'From 0.1 pips', commission: '$3.5/lot', leverage: '1:2000', features: ['Tighter spreads', 'Low commission', 'All instruments', 'Priority support'], highlight: true },
              { name: 'Raw Spread', minDeposit: '$500', spread: 'From 0.0 pips', commission: '$7/lot', leverage: '1:2000', features: ['Raw market spreads', 'Professional tools', 'VPS access', 'Dedicated manager'] },
            ].map(acct => (
              <div key={acct.name} className={`rounded-2xl p-6 border ${acct.highlight ? 'bg-emerald-500/5 border-emerald-500/30 relative overflow-hidden' : 'bg-gray-900 border-gray-800'}`}>
                {acct.highlight && (
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">Most Popular</div>
                )}
                <h3 className="text-white text-xl font-bold mb-1">{acct.name}</h3>
                <div className="text-gray-400 text-sm mb-4">Min. deposit: {acct.minDeposit}</div>
                <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="text-gray-500 text-xs mb-1">Spreads</div>
                    <div className="text-white font-medium">{acct.spread}</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="text-gray-500 text-xs mb-1">Commission</div>
                    <div className="text-white font-medium">{acct.commission}</div>
                  </div>
                </div>
                <ul className="space-y-2 mb-6">
                  {acct.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-gray-400 text-sm">
                      <CheckCircle size={13} className="text-emerald-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={onGetStarted}
                  className={`w-full py-3 rounded-xl font-medium text-sm transition-colors ${acct.highlight ? 'bg-emerald-500 hover:bg-emerald-400 text-white' : 'border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white'}`}
                >
                  Open {acct.name} Account
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-y border-emerald-500/20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to start trading?</h2>
          <p className="text-gray-400 text-lg mb-8">Join over 800,000 traders who trust TradeX for their trading needs</p>
          <button
            onClick={onGetStarted}
            className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-10 py-4 rounded-xl text-lg transition-colors inline-flex items-center gap-2"
          >
            Open Free Account <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
              <TrendingUp size={14} className="text-white" />
            </div>
            <span className="text-white font-bold">TradeX</span>
          </div>
          <div className="flex flex-wrap gap-6 justify-center">
            {['Regulations', 'Privacy Policy', 'Terms of Service', 'Risk Warning'].map(link => (
              <button key={link} className="text-gray-500 hover:text-gray-300 text-sm transition-colors">{link}</button>
            ))}
          </div>
          <p className="text-gray-600 text-sm">2024 TradeX. Educational demo only.</p>
        </div>
      </footer>
    </div>
  );
}
