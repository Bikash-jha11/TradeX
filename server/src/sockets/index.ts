import websocket from "ws";


function getOrderBook(){
   const wss = new websocket("");

wss.on("open", () => {
  console.log("New client connected");

  // Send a welcome message to the client
  wss.send(JSON.stringify({
    id: "",
    method: "depth",
    params: {
      symbol: "BTCUSDT",
    },
  }));

  // Message event handler
  wss.on("message", (message:any) => {
    console.log(JSON.parse(message));
  });


});
}


