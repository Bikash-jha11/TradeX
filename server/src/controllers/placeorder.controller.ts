// controllers/order.controller.ts
import { Request, Response } from "express";
import axios from "axios";
import prisma from "config/prisma.config";

export const placeOrder = async (req: Request, res: Response) => {


  const { userId, symbol, side, quantity, price } = req.body;

  const localOrder = await prisma.order.create({
    data: {
      userId: Number(userId),
      symbol: String(symbol),
      side: side,
      quantity: parseFloat(quantity),
      remainingQty: 0,
      price: parseFloat(price),
      status: "PENDING",
    },
  });

  const binanceResp = await axios.post(
    "",
    null,
    {
      params: {
        symbol,
        side,
        quantity,
        price,
        type: "LIMIT",
        timestamp: Date.now(),
      },
      headers: { "X-MBX-APIKEY": process.env.BINANCE_KEY },
    },
  );

  // 3. Update with the external ID received from Binance
  await prisma.order.update({
    where: { id: localOrder.id },
    data: { externalId: binanceResp.data.orderId.toString() },
  });

  res.json({ success: true, orderId: localOrder.id });

  res.json({ localOrder });
};
