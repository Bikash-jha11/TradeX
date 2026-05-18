# TradeX  - Fullstack Trading Platform

A production-grade exness-style trading platform with real-time market simulation, caching message queue for order processing, and a complete trading workflow.
<img width="1377" height="670" alt="image" src="https://github.com/user-attachments/assets/a3406729-ea19-4bbc-8fdb-eb14ddd37faf" />


---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + TypeScript | UI framework with type safety |
| Build | Vite 5 | Fast dev server & production bundler |
| Styling | Tailwind CSS 3 | Utility-first CSS with custom design system |
| Icons | Lucide React | Consistent icon library |
| Database | Supabase (PostgreSQL) | Data persistence, auth, RLS |
| Auth | Supabase Auth (email/password) | User registration, login, session management |
| Serverless | Supabase Edge Functions (Deno) | Order queue processor |
| Client SDK | @supabase/supabase-js v2 | Database queries, auth, real-time |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                   Browser                        │
│  ┌───────────────────────────────────────────┐  │
│  │            React App (SPA)                │  │
│  │  ┌─────────┐  ┌──────────┐  ┌─────────┐  │  │
│  │  │  Pages   │  │  Hooks   │  │  Libs   │  │  │
│  │  │  (7)     │──│  (3)     │──│  (3)    │  │  │
│  │  └─────────┘  └──────────┘  └─────────┘  │  │
│  │       │              │            │        │  │
│  │       └──────────────┼────────────┘        │  │
│  │                      │                     │  │
│  │              ┌───────┴───────┐             │  │
│  │              │  TTL Cache    │             │  │
│  │              │  (in-memory)  │             │  │
│  │              └───────────────┘             │  │
│  └───────────────────────────────────────────┘  │
│                      │                          │
│            Supabase JS Client (REST)            │
└──────────────────────┬──────────────────────────┘
                       │
          ┌────────────┴────────────┐
          │      Supabase Backend   │
          │  ┌──────────────────┐  │
          │  │   PostgreSQL DB   │  │
          │  │  ┌──────────────┐│  │
          │  │  │  RLS Policies ││  │
          │  │  └──────────────┘│  │
          │  └──────────────────┘  │
          │  ┌──────────────────┐  │
          │  │   Auth Service    │  │
          │  │  (email/password) │  │
          │  └──────────────────┘  │
          │  ┌──────────────────┐  │
          │  │  Edge Functions  │  │
          │  │  (process-orders)│  │
          │  └──────────────────┘  │
          └─────────────────────────┘
```

---

## Frontend Architecture

### File Structure

```
src/
├── App.tsx                    # Root: auth gate, page routing, layout shell
├── types/index.ts             # Shared TypeScript interfaces
├── lib/
│   ├── supabase.ts            # Singleton Supabase client
│   ├── cache.ts               # TTL in-memory cache (class-based)
│   └── marketSimulator.ts     # Random-walk price engine
├── hooks/
│   ├── useAuth.ts             # Auth state, sign in/up/out, profile fetch
│   ├── useMarketData.ts       # Live price ticking + cache integration
│   └── useTrades.ts           # Position/order/transaction CRUD + queue
├── components/
│   ├── auth/AuthPage.tsx      # Login/register split panel
│   ├── layout/
│   │   ├── Sidebar.tsx        # Navigation + balance card
│   │   └── Topbar.tsx         # Search, notifications, user menu
│   └── pages/
│       ├── Landing.tsx        # Public marketing page
│       ├── Dashboard.tsx      # Portfolio overview + watchlist
│       ├── Markets.tsx        # Full instrument table
│       ├── Trading.tsx        # Chart + order form + positions
│       ├── History.tsx        # Trade & transaction history
│       ├── Deposit.tsx        # Deposit/withdraw flow
│       └── Account.tsx        # Profile, verification, account type
```

### Routing

Client-side state routing (no router library). `App.tsx` holds a `page` state (`Page` type union) and conditionally renders the matching component. This keeps the bundle lean with zero extra dependencies.

### State Flow

```
User Action
    │
    ▼
React Hook (useAuth / useTrades / useMarketData)
    │
    ├──► Supabase Client ──► PostgreSQL (via REST + RLS)
    │                              │
    │                              ├── Trigger: auto-create profile on signup
    │                              └── RLS: user can only read/write own rows
    │
    ├──► TTL Cache (check before fetch)
    │         │
    │         ├── HIT  → return cached data
    │         └── MISS → fetch from Supabase → cache result → return
    │
    └──► Order Queue (for trades)
              │
              ├── INSERT into order_queue (status: pending)
              ├── INSERT into positions (optimistic)
              └── Edge Function polls & processes
```

---

## Caching Architecture

### Client-side TTL Cache (`src/lib/cache.ts`)

Generic `Map<string, CacheEntry<T>>` with expiry timestamps. Different TTLs per data type:

| Data | TTL | Rationale |
|------|-----|-----------|
| Market prices | 2s | Prices tick every 1.5s, cache prevents redundant re-renders |
| Positions | 5s | Balance changes need near-real-time visibility |
| Orders | 10s | Historical data, less urgent |
| User profile | 30s | Rarely changes |
| Instruments | 5min | Static reference data |

Cache invalidation: explicit `cache.delete()` after mutations (open/close position, deposit). Prefix-based invalidation: `cache.invalidatePrefix('market:')` for bulk clears.

---

## Message Queue Architecture

### Order Queue — database-backed queue using the `order_queue` table

```
Trade Request
    │
    ▼
1. INSERT into orders (status: pending)
2. INSERT into order_queue (status: pending, priority, payload)
3. INSERT into positions (status: open)  ← optimistic for instant UI
    │
    ▼
Edge Function: process-orders
    │
    ├── SELECT * FROM order_queue WHERE status = 'pending'
    │   ORDER BY priority ASC, queued_at ASC LIMIT 10
    │
    ├── For each item:
    │   ├── UPDATE status → 'processing'
    │   ├── Process action (open_position / close_position / modify)
    │   │   ├── Update order status → 'filled'
    │   │   ├── Update profile balance/margin/equity
    │   │   └── Record transaction
    │   ├── On success: UPDATE status → 'completed'
    │   └── On failure: increment retry_count
    │       └── If retry_count >= max_retries: status → 'failed'
    │           else: status → 'pending' (re-queue)
    │
    └── Return processing results
```

### Queue Design Decisions

- **Priority field** (1-10): market orders get priority 1, modifications get 5
- **Retry logic**: max 3 retries with exponential backoff potential
- **Atomic processing**: each item is marked `processing` before work begins, preventing double-processing
- **Idempotency**: re-processing a completed item is safe because status checks gate the logic
- **Batch processing**: edge function processes up to 10 items per invocation

---

## Database Schema

```
auth.users (Supabase built-in)
    │
    ├── 1:1 ── profiles
    │            id → auth.users.id (FK + PK)
    │            balance, equity, margin, free_margin
    │            leverage, account_type, verification_status
    │
    ├── 1:N ── positions
    │            user_id → auth.users.id
    │            instrument_id → instruments.id
    │            direction (buy/sell), lot_size, open_price
    │            current_price, profit_loss, margin_used
    │            status (open/closed/pending)
    │
    ├── 1:N ── orders
    │            user_id → auth.users.id
    │            Same as positions + close_price, commission
    │            status (pending/filled/cancelled/rejected)
    │
    ├── 1:N ── order_queue
    │            user_id → auth.users.id
    │            order_id → orders.id
    │            action, payload (JSONB), status, priority
    │            retry_count, max_retries, error_message
    │
    └── 1:N ── transactions
                 user_id → auth.users.id
                 type (deposit/withdrawal/trade_profit/etc.)
                 amount, balance_after, reference_id

instruments (read-only reference)
    symbol, name, category, pip_value, min/max_lot, spread

market_data_cache (server-side price cache)
    symbol, bid, ask, last_price, change_24h
    cached_at, expires_at (10s TTL)
```

### RLS Policies

Every table has restrictive policies:

- Users can only `SELECT/INSERT/UPDATE` their own rows (`auth.uid() = user_id`)
- `instruments` and `market_data_cache` are readable by all authenticated users
- No `USING(true)` policies — nothing is publicly accessible without auth
- Separate policies for SELECT, INSERT, UPDATE, DELETE (no `FOR ALL`)

---

## Market Data Pipeline

```
marketSimulator.ts (client-side)
    │
    ├── BASE_PRICES map (28 instruments)
    ├── VOLATILITY map (per-symbol tick size)
    ├── SPREADS map (per-symbol bid-ask spread)
    │
    ├── tickPrices()  ← called every 1.5s by useMarketData
    │   └── randomWalk(current, volatility) → new price
    │
    ├── getMarketData(symbol) → MarketData object
    │   └── bid, ask, change_24h, high/low, volume
    │
    └── getPriceHistory(symbol) → number[] (last 200 ticks)
        └── Used by MiniChart and PriceChart SVG components
```

The simulator uses a slight upward bias (`Math.random() - 0.495`) to create realistic-looking drift. Each instrument has calibrated volatility — BTC moves ~$50/tick while EURUSD moves ~0.00008/tick.

---

## Authentication Flow

```
Landing Page → "Open Account" → AuthPage (register)
                              → "Sign In"    → AuthPage (login)
    │
    ▼
supabase.auth.signUp({ email, password, options: { data: { full_name } } })
    │
    ├── Creates auth.users record
    ├── Trigger fires: handle_new_user()
    │   └── INSERT into profiles (id, email, full_name, balance=10000)
    └── Session established → App renders dashboard

supabase.auth.signInWithPassword({ email, password })
    │
    └── Session restored → useAuth fetches profile → App renders
```

Email confirmation is disabled. New users get a $10,000 demo balance automatically via the database trigger.

---

## Edge Function: process-orders

Deployed at `/functions/v1/process-orders`. Processes the order queue with the following logic:

1. Fetch up to 10 pending items ordered by priority then queue time
2. Mark each item as `processing` to prevent double-processing
3. Execute the action (`open_position`, `close_position`, `modify_position`)
4. Update profile balance/margin/equity atomically
5. Record financial transactions
6. On failure: increment retry count, re-queue if under max retries, mark failed if exhausted

The function uses the Supabase service role key for elevated database access to update balances and process queue items across user boundaries.

---

## Design System

- **Color palette**: Emerald primary, neutral grays, red for sell/loss, amber for warnings
- **Spacing**: 8px grid system
- **Typography**: System font stack, 3 weights max (400, 600, 700)
- **Line height**: 150% body, 120% headings
- **Border radius**: `rounded-xl` (12px) for cards, `rounded-2xl` (16px) for panels
- **Dark theme**: Gray-950 background, Gray-900 surfaces, Gray-800 borders
- **Contrast**: All text meets WCAG AA contrast ratios on dark backgrounds
