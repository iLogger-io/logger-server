import WebSocket from "ws";
import * as encryption from "./lib/encryption";
import wssRoute from "./api/wssRoute";
import * as globalVar from "./lib/globalVar";
import * as convert from "./lib/convert";

export const init = function (server: any) {
  const wss = new WebSocket.Server({ server });
  (wss as any).getUniqueID = function () {
    return encryption.genid();
  };

  wss.on("connection", function connection(ws: any) {
    ws.id = (wss as any).getUniqueID();
    globalVar.wssClientStorage[ws.id] = ws;
    ws.isAlive = true;
    ws.on("pong", function () {
      ws.isAlive = true;
    });

    ws.on("message", function incoming(message: any) {
      if (Buffer.isBuffer(message)) {
        // const JsonLength = convert.buf2num(message.slice(0, 2));
        // const WssJson = JSON.parse(message.slice(2, JsonLength + 2));
        // const dataLength = message.length - JsonLength - 2;
        // if (dataLength > 0) {
        //   ws.dataBuf = message.slice(JsonLength + 2, message.length).toString("utf8");
        // }
        // wssRoute(WssJson, ws);
      } else if (typeof message === "string") {
        wssRoute(JSON.parse(message), ws);
      }
    });

    // ws.send('s:something')

    ws.on("close", function close() {
      console.log("close", ws.id);
      delete globalVar.wssClientStorage[ws.id];
    });
  });

  const interval = setInterval(function ping() {
    wss.clients.forEach(function each(ws: any) {
      if (ws.isAlive === false) {
        console.log("ws.isAlive: false", ws.id);
        delete globalVar.wssClientStorage[ws.id];
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
