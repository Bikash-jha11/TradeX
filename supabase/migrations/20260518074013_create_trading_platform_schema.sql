/*
  # Trading Platform Schema

  1. New Tables
    - `profiles` - Extended user profile with balance, leverage settings
      - `id` (uuid, FK to auth.users)
      - `full_name`, `email`, `phone`, `country`
      - `balance`, `equity`, `margin`, `free_margin`
      - `leverage`, `account_type`, `verification_status`
    - `instruments` - Tradeable instruments (forex, crypto, commodities)
      - `symbol`, `name`, `category`, `pip_value`, `min_lot`, `max_lot`
    - `positions` - Open trading positions
      - `user_id`, `instrument_id`, `direction` (buy/sell)
      - `lot_size`, `open_price`, `current_price`, `profit_loss`
      - `take_profit`, `stop_loss`, `status`
    - `orders` - Completed/historical orders
      - Same fields as positions + close_price, close_reason
    - `order_queue` - Message queue for async trade processing
      - `order_id`, `user_id`, `payload` (JSONB), `status`, `priority`
      - `processed_at`, `error_message`, `retry_count`
    - `transactions` - Financial transaction ledger
      - `user_id`, `type` (deposit/withdrawal/trade), `amount`, `status`

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - Service role can access order_queue for processing

  3. Seed Data
    - 20+ tradeable instruments across forex, crypto, commodities, indices
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  email text DEFAULT '',
  phone text DEFAULT '',
  country text DEFAULT '',
  avatar_url text DEFAULT '',
  balance numeric(20, 2) DEFAULT 10000.00,
  equity numeric(20, 2) DEFAULT 10000.00,
  margin numeric(20, 2) DEFAULT 0.00,
  free_margin numeric(20, 2) DEFAULT 10000.00,
  leverage integer DEFAULT 100,
  account_type text DEFAULT 'standard',
  verification_status text DEFAULT 'unverified',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Instruments table
CREATE TABLE IF NOT EXISTS instruments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text UNIQUE NOT NULL,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'forex',
  base_currency text DEFAULT '',
  quote_currency text DEFAULT '',
  pip_value numeric(10, 5) DEFAULT 0.00001,
  min_lot numeric(10, 2) DEFAULT 0.01,
  max_lot numeric(10, 2) DEFAULT 100.00,
  lot_step numeric(10, 2) DEFAULT 0.01,
  spread numeric(10, 5) DEFAULT 0.00002,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE instruments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view instruments"
  ON instruments FOR SELECT
  TO authenticated
  USING (true);

-- Positions table (open trades)
CREATE TABLE IF NOT EXISTS positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  instrument_id uuid NOT NULL REFERENCES instruments(id),
  symbol text NOT NULL,
  direction text NOT NULL CHECK (direction IN ('buy', 'sell')),
  lot_size numeric(10, 2) NOT NULL,
  open_price numeric(20, 8) NOT NULL,
  current_price numeric(20, 8) DEFAULT 0,
  take_profit numeric(20, 8),
  stop_loss numeric(20, 8),
  margin_used numeric(20, 2) DEFAULT 0,
  profit_loss numeric(20, 2) DEFAULT 0,
  swap numeric(20, 2) DEFAULT 0,
  status text DEFAULT 'open' CHECK (status IN ('open', 'closed', 'pending')),
  opened_at timestamptz DEFAULT now(),
  closed_at timestamptz,
  close_price numeric(20, 8),
  close_reason text
);

ALTER TABLE positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own positions"
  ON positions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own positions"
  ON positions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own positions"
  ON positions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Orders table (trade history)
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  instrument_id uuid REFERENCES instruments(id),
  symbol text NOT NULL,
  direction text NOT NULL CHECK (direction IN ('buy', 'sell')),
  lot_size numeric(10, 2) NOT NULL,
  open_price numeric(20, 8) NOT NULL,
  close_price numeric(20, 8),
  take_profit numeric(20, 8),
  stop_loss numeric(20, 8),
  profit_loss numeric(20, 2) DEFAULT 0,
  commission numeric(20, 2) DEFAULT 0,
  swap numeric(20, 2) DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'filled', 'cancelled', 'rejected')),
  close_reason text,
  opened_at timestamptz DEFAULT now(),
  closed_at timestamptz
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Order queue (message queue for async processing)
CREATE TABLE IF NOT EXISTS order_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id),
  action text NOT NULL CHECK (action IN ('open_position', 'close_position', 'modify_position')),
  payload jsonb NOT NULL DEFAULT '{}',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  priority integer DEFAULT 5,
  retry_count integer DEFAULT 0,
  max_retries integer DEFAULT 3,
  error_message text,
  queued_at timestamptz DEFAULT now(),
  processing_started_at timestamptz,
  processed_at timestamptz
);

ALTER TABLE order_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own queue items"
  ON order_queue FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own queue items"
  ON order_queue FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'trade_profit', 'trade_loss', 'commission', 'swap', 'bonus')),
  amount numeric(20, 2) NOT NULL,
  balance_after numeric(20, 2) DEFAULT 0,
  description text DEFAULT '',
  reference_id uuid,
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_positions_user_id ON positions(user_id);
CREATE INDEX IF NOT EXISTS idx_positions_status ON positions(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_queue_status ON order_queue(status);
CREATE INDEX IF NOT EXISTS idx_order_queue_user_id ON order_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
