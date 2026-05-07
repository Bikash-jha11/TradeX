// src/services/binanceSync.ts
import WebSocket from 'ws';
import { engine } from '../engine/engine';
import prisma from "config/prisma.config";

export const startBinanceTradeSync = (symbol: string) => {
  const ws = new WebSocket(``);

  ws.on('message', async (data) => {
    const rawTrade = JSON.parse(data.toString());

    // A. SYNC TO DB: Save the trade for your charts/history
    await prisma.externalTrade.create({
      data: {
        symbol: rawTrade.s,
        price: parseFloat(rawTrade.p),
        quantity: parseFloat(rawTrade.q),
        timestamp: new Date(rawTrade.T)
      }
    });

   
    // that hit your local limit order book.
    await engine.processOrder({
       id: `binance_${rawTrade.t}`, // Use Binance Trade ID
       userId: String(0),                   // System/External user
       symbol: rawTrade.s,
       price: parseFloat(rawTrade.p),
       quantity: parseFloat(rawTrade.q),
       side: rawTrade.m ? "BUY" : "SELL", // 'm' is 'is the buyer the market maker?'
       status: "FILLED" 
    });
  });
};