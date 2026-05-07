import { engine } from "engine/engine";
import { startBinanceTradeSync } from "service/binancesync";
import prisma from "config/prisma.config";
import { OrderStatus } from "../../generated/prisma/enums";

export async function bootstrap() {
  console.log("Initializing Trading Engine...");


  const pendingOrders = await prisma.order.findMany({
    where: { status: "PENDING" }
  });
  
  for (const dbOrder of pendingOrders) {
    // Manually map the DB result to the Engine's Order interface
    engine.processOrder({
      id: dbOrder.id,
      userId: String(dbOrder.userId), 
      symbol: dbOrder.symbol,
      price: dbOrder.price,
      quantity: dbOrder.quantity,
      // Cast the string side to the specific "BUY" | "SELL" union type
      side: dbOrder.side as "BUY" | "SELL", 
      status: dbOrder.status as OrderStatus
    });
  }


  startBinanceTradeSync("BTCUSDT");

  console.log("Exchange is live and synced.");
}

bootstrap();