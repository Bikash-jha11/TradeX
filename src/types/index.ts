export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  country: string;
  avatar_url: string;
  balance: number;
  equity: number;
  margin: number;
  free_margin: number;
  leverage: number;
  account_type: string;
  verification_status: string;
  created_at: string;
}

export interface Instrument {
  id: string;
  symbol: string;
  name: string;
  category: string;
  base_currency: string;
  quote_currency: string;
  pip_value: number;
  min_lot: number;
  max_lot: number;
  lot_step: number;
  spread: number;
  is_active: boolean;
}

export interface MarketData {
  symbol: string;
  bid: number;
  ask: number;
  last_price: number;
  change_24h: number;
  change_percent_24h: number;
  high_24h: number;
  low_24h: number;
  volume_24h: number;
  cached_at: string;
}

export interface Position {
  id: string;
  user_id: string;
  instrument_id: string;
  symbol: string;
  direction: 'buy' | 'sell';
  lot_size: number;
  open_price: number;
  current_price: number;
  take_profit: number | null;
  stop_loss: number | null;
  margin_used: number;
  profit_loss: number;
  swap: number;
  status: 'open' | 'closed' | 'pending';
  opened_at: string;
  closed_at: string | null;
  close_price: number | null;
  close_reason: string | null;
}

export interface Order {
  id: string;
  user_id: string;
  instrument_id: string | null;
  symbol: string;
  direction: 'buy' | 'sell';
  lot_size: number;
  open_price: number;
  close_price: number | null;
  take_profit: number | null;
  stop_loss: number | null;
  profit_loss: number;
  commission: number;
  swap: number;
  status: 'pending' | 'filled' | 'cancelled' | 'rejected';
  close_reason: string | null;
  opened_at: string;
  closed_at: string | null;
}

export interface OrderQueueItem {
  id: string;
  user_id: string;
  order_id: string | null;
  action: 'open_position' | 'close_position' | 'modify_position';
  payload: Record<string, unknown>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: number;
  retry_count: number;
  error_message: string | null;
  queued_at: string;
  processed_at: string | null;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal' | 'trade_profit' | 'trade_loss' | 'commission' | 'swap' | 'bonus';
  amount: number;
  balance_after: number;
  description: string;
  reference_id: string | null;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
}

export type Page = 'dashboard' | 'markets' | 'trading' | 'history' | 'account' | 'deposit';
