import { useState, useEffect } from "react";
import { useAuth } from "./hooks/aseAuth";
import { useTrades } from "./hooks/useTrades";
import { AuthPage } from "./components/auth/AuthPage";
import { Landing } from "./components/pages/Landing";
import { Sidebar } from "./components/layout/Sidebar";
import { Topbar } from "./components/layout/Topbar";
import { Dashboard } from "./components/pages/Dashbaord";
import { Markets } from "./components/pages/Markets";
import { Trading } from "./components/pages/Trading";
import { History } from "./components/pages/History";
import { Deposit } from "./components/pages/Deposit";
import { Account } from "./components/pages/Account";

type Page =
  | "dashboard"
  | "markets"
  | "trading"
  | "history"
  | "account"
  | "deposit";

const PAGE_TITLES: Record<Page, string> = {
  dashboard: "Dashboard",
  markets: "Markets",
  trading: "Trading",
  history: "Trade History",
  deposit: "Deposit & Withdraw",
  account: "Account Settings",
};

export default function App() {
  const { user, profile, loading, signIn, signUp, signOut, refreshProfile } =
    useAuth();
  const { positions, orders, transactions, openPosition, closePosition } =
    useTrades(user?.id);
  const [page, setPage] = useState<Page>("dashboard");
  const [showAuth, setShowAuth] = useState(false);
  const [tradingSymbol, setTradingSymbol] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    if (user && showAuth) setShowAuth(false);
  }, [user, showAuth]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (showAuth) {
      return <AuthPage onSignIn={signIn} onSignUp={signUp} />;
    }
    return <Landing onGetStarted={() => setShowAuth(true)} />;
  }

  const equity =
    (profile?.balance ?? 0) +
    positions.reduce((s, p) => s + (p.profit_loss ?? 0), 0);

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <Sidebar
        currentPage={page}
        onNavigate={setPage}
        onSignOut={signOut}
        balance={profile?.balance ?? 0}
        equity={equity}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar profile={profile} title={PAGE_TITLES[page]} />
        <main className="flex-1 overflow-auto">
          {page === "dashboard" && (
            <Dashboard
              profile={profile}
              positions={positions}
              onNavigate={(p) => setPage(p)}
            />
          )}
          {page === "markets" && (
            <Markets
              onTrade={(symbol) => {
                setTradingSymbol(symbol);
                setPage("trading");
              }}
            />
          )}
          {page === "trading" && (
            <Trading
              profile={profile}
              positions={positions}
              selectedSymbol={tradingSymbol}
              onOpenPosition={openPosition}
              onClosePosition={closePosition}
            />
          )}
          {page === "history" && (
            <History orders={orders} transactions={transactions} />
          )}
          {page === "deposit" && (
            <Deposit profile={profile} onRefresh={refreshProfile} />
          )}
          {page === "account" && (
            <Account profile={profile} onRefresh={refreshProfile} />
          )}
        </main>
      </div>
    </div>
  );
}
