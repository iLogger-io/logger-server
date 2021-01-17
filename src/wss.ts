import WebSocket from "ws";
import wssRoute from "./api/wssRoute";
import { wssClientStorage } from "./lib/globalVar";
import { genid } from "./utils/helper";

export const init = function (server: any) {
  const wss = new WebSocket.Server({ server });
  (wss as any).getUniqueID = function () {
    return genid();
  };

  wss.on("connection", function connection(ws: any) {
    ws.id = (wss as any).getUniqueID();
    wssClientStorage[ws.id] = ws;
    ws.isAlive = true;
    ws.on("pong", function () {
      ws.isAlive = true;
    });

    ws.on("message", function incoming(message: WebSocket.Data) {
      const msgJson = JSON.parse(message.toString());
      console.log("msgJson", msgJson);
    });

    ws.on("close", function close() {
      console.log("close", ws.id);
      delete wssClientStorage[ws.id];
    });
  });

  const interval = setInterval(function ping() {
    wss.clients.forEach(function each(ws: any) {
      if (ws.isAlive === false) {
        console.log("ws.isAlive: false", ws.id);
        delete wssClientStorage[ws.id];
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping(function () {});
    });
  }, 30000);

  wss.on("close", function close() {
    console.log("wss.on close");
    clearInterval(interval);
  });
};

export const SendMessageToClient = function (ws: any, message: any) {
  ws.send(JSON.stringify(message));
};
