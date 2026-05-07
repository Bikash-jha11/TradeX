import prisma from "config/prisma.config";
import { Order } from "../types/interfaces/interfaces.common";
import { BPlusTree } from "b+/body";

export class TradingEngine {
  public markets: Map<string, { bids: BPlusTree; asks: BPlusTree }> = new Map();

  constructor(private t: number = 3) {}

  private getMarket(symbol: string) {
    if (!this.markets.has(symbol)) {
      this.markets.set(symbol, {
        bids: new BPlusTree(this.t),
        asks: new BPlusTree(this.t),
      });
    }
    return this.markets.get(symbol)!;
  }

  public async processOrder(order: Order) {
    const { bids, asks } = this.getMarket(order.symbol);

    // If BUY, try to match against ASKS (Sellers)
    // If SELL, try to match against BIDS (Buyers)
    if (order.side === "BUY") {
      await this.match(order, asks, bids);
    } else {
      await this.match(order, bids, asks);
    }
  }

  private async match(
    taker: Order,
    counterTree: BPlusTree,
    ownTree: BPlusTree,
  ) {
    let remaining = taker.quantity;

    while (remaining > 0) {
      // Get the best price from the opposite side (lowest Ask for Buy, highest Bid for Sell)
      const bestMakerPrice = counterTree.getBestPrice(
        taker.side === "BUY" ? "MIN" : "MAX",
      );

      // Break if no liquidity or price doesn't cross
      if (!bestMakerPrice || !this.canMatch(taker, bestMakerPrice)) break;

      const makerOrders = counterTree.getOrdersAtPrice(bestMakerPrice);
      
      // Process the FIFO queue at this price level
      while (makerOrders.length > 0 && remaining > 0) {
        const maker = makerOrders[0];
        const matchQty = Math.min(remaining, maker.quantity);

        // Update local memory state
        remaining -= matchQty;
        maker.quantity -= matchQty;

        // Persist the trade and update order statuses in DB
        await this.executeTrade(taker, maker, matchQty, bestMakerPrice);

        // If maker is fully filled, remove from the FIFO queue
        if (maker.quantity === 0) {
          makerOrders.shift();
        }
      }

      // If the entire price level is cleared, remove the key from the B+ Tree
      if (makerOrders.length === 0) {
        counterTree.delete(bestMakerPrice);
      }
    }

    // 3. Post-match: If Taker still has quantity, it becomes a Limit Order in the tree
    if (remaining > 0) {
      taker.quantity = remaining;
      ownTree.insert(taker.price, taker);
      
      // Optional: Update DB status to 'PARTIALLY_FILLED' or keep 'PENDING'
    }
  }

  private canMatch(taker: Order, makerPrice: number) {
    return taker.side === "BUY"
      ? taker.price >= makerPrice
      : taker.price <= makerPrice;
  }

  private async executeTrade(t: Order, m: Order, qty: number, price: number) {
    // We use a transaction to ensure Trade creation and Order updates are atomic
    await prisma.$transaction([
      // 1. Create the Trade Record
      prisma.trade.create({
        data: {
          symbol: t.symbol,
          price,
          quantity: qty,
          takerOrderId: t.id,
          makerOrderId: m.id,
        },
      }),
      // 2. Update Maker remaining quantity and status
      prisma.order.update({
        where: { id: m.id },
        data: {
          quantity: { decrement: qty },
          status: m.quantity === 0 ? "FILLED" : "PARTIALLY_FILLED",
        },
      }),
      // 3. Update Taker remaining quantity and status
      prisma.order.update({
        where: { id: t.id },
        data: {
          quantity: { decrement: qty },
          status: t.quantity === (t.quantity - qty) ? "PENDING" : (t.quantity === 0 ? "FILLED" : "PARTIALLY_FILLED"),
        },
      }),
    ]);

    // TODO: Emit via WebSocket to 'order_updates' and 'trade_history' channels
    console.log(`[MATCH] ${qty} @ ${price} | Taker: ${t.id} Maker: ${m.id}`);
  }
}

export const engine = new TradingEngine(3);