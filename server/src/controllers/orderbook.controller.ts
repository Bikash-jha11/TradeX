// controllers/orderbook.controller.ts
import { Request, Response } from "express";
import { engine } from "../engine/engine"; // Assuming engine is exported from your main file

export const getLocalOrderBook = async (req: Request, res: Response) => {
  const { symbol } = req.params;
  const market = engine.markets.get(symbol);

  if (!market) {
    return res.status(404).json({ message: "Market not found" });
  }
  const depth = {
    bids: market.bids.getAggregatedLevels(50),
    asks: market.asks.getAggregatedLevels(50),
    timestamp: Date.now()
  };

  res.json(depth);
};