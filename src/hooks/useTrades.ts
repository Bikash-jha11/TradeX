import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { cache, CACHE_TTL } from '../lib/cache';
import type { Position, Order, Transaction } from '../types';

export function useTrades(userId: string | undefined) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPositions = useCallback(async () => {
    if (!userId) return;
    const cacheKey = `positions:${userId}`;
    const cached = cache.get<Position[]>(cacheKey);
    if (cached) { setPositions(cached); return; }

    const { data } = await supabase
      .from('positions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'open')
      .order('opened_at', { ascending: false });

    const result = data ?? [];
    cache.set(cacheKey, result, CACHE_TTL.POSITIONS);
    setPositions(result);
  }, [userId]);

  const fetchOrders = useCallback(async () => {
    if (!userId) return;
    const cacheKey = `orders:${userId}`;
    const cached = cache.get<Order[]>(cacheKey);
    if (cached) { setOrders(cached); return; }

    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('opened_at', { ascending: false })
      .limit(50);

    const result = data ?? [];
    cache.set(cacheKey, result, CACHE_TTL.ORDERS);
    setOrders(result);
  }, [userId]);

  const fetchTransactions = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    setTransactions(data ?? []);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    Promise.all([fetchPositions(), fetchOrders(), fetchTransactions()]).finally(() => setLoading(false));
  }, [userId, fetchPositions, fetchOrders, fetchTransactions]);

  async function openPosition(params: {
    userId: string;
    symbol: string;
    instrumentId: string;
    direction: 'buy' | 'sell';
    lotSize: number;
    openPrice: number;
    takeProfit?: number;
    stopLoss?: number;
    leverage: number;
  }) {
    const marginUsed = (params.lotSize * 100000 * params.openPrice) / params.leverage;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: params.userId,
        instrument_id: params.instrumentId,
        symbol: params.symbol,
        direction: params.direction,
        lot_size: params.lotSize,
        open_price: params.openPrice,
        take_profit: params.takeProfit ?? null,
        stop_loss: params.stopLoss ?? null,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) return { error: orderError };

    await supabase.from('order_queue').insert({
      user_id: params.userId,
      order_id: order.id,
      action: 'open_position',
      payload: {
        symbol: params.symbol,
        instrument_id: params.instrumentId,
        direction: params.direction,
        lot_size: params.lotSize,
        open_price: params.openPrice,
        take_profit: params.takeProfit ?? null,
        stop_loss: params.stopLoss ?? null,
        margin_used: marginUsed,
      },
      priority: 1,
    });

    await supabase.from('positions').insert({
      user_id: params.userId,
      instrument_id: params.instrumentId,
      symbol: params.symbol,
      direction: params.direction,
      lot_size: params.lotSize,
      open_price: params.openPrice,
      current_price: params.openPrice,
      take_profit: params.takeProfit ?? null,
      stop_loss: params.stopLoss ?? null,
      margin_used: marginUsed,
      status: 'open',
    });

    await supabase.from('orders').update({ status: 'filled' }).eq('id', order.id);

    cache.delete(`positions:${params.userId}`);
    cache.delete(`orders:${params.userId}`);
    await fetchPositions();
    await fetchOrders();
    return { error: null };
  }

  async function closePosition(position: Position, closePrice: number, userId: string) {
    const pnl = position.direction === 'buy'
      ? (closePrice - position.open_price) * position.lot_size * 100000
      : (position.open_price - closePrice) * position.lot_size * 100000;

    await supabase.from('positions').update({
      status: 'closed',
      close_price: closePrice,
      closed_at: new Date().toISOString(),
      close_reason: 'manual',
      profit_loss: pnl,
    }).eq('id', position.id);

    await supabase.from('order_queue').insert({
      user_id: userId,
      action: 'close_position',
      payload: { position_id: position.id, close_price: closePrice, profit_loss: pnl },
      priority: 1,
    });

    await supabase.from('transactions').insert({
      user_id: userId,
      type: pnl >= 0 ? 'trade_profit' : 'trade_loss',
      amount: pnl,
      description: `${position.direction.toUpperCase()} ${position.lot_size} lots ${position.symbol}`,
      reference_id: position.id,
    });

    cache.delete(`positions:${userId}`);
    cache.delete(`orders:${userId}`);
    await fetchPositions();
    await fetchOrders();
    await fetchTransactions();
    return { error: null, pnl };
  }

  return { positions, orders, transactions, loading, openPosition, closePosition, fetchPositions, fetchTransactions };
}
