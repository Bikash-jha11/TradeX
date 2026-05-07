import express, { Request, Response } from "express";
import WebSocket from "ws";

export function getOrderBook(req: Request, res: Response): void {
  try {
    let {symbol,limit} = req.query;
    if(!limit){
        limit = "10";
    }
    const wss = new WebSocket("");

    wss.on("open", () => {
      console.log("New client connected");

      wss.send(
        JSON.stringify({
          id: "",
          method: "depth",
          params: {
            symbol: symbol,
            limit: limit,
          },
        }),
      );

      // Message event handler
      wss.on("message", (message: any) => {
        res.status(200).json(JSON.parse(message));
      });
    });
  } catch (error) {
    console.log(error);
  }
}
