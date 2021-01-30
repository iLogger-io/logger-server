import WebSocket from "ws";
import * as topic from "./constants/topic";
import { wssClientStorage } from "./lib/global_var";
import { genid } from "./utils/helper";
import logger from "./utils/logger";
import { WSDataType } from "./types/index";
import ClientToken from "./ws_topic/getting/client_token";
import registerClient from "./ws_topic/getting/register_client";
import ClientLog from "./ws_topic/getting/client_log";

export const init = function (server: any) {
  const wss: any = new WebSocket.Server({ server });
  wss.getUniqueID = function () {
    return genid();
  };

  wss.on("connection", function connection(ws: any) {
    ws.id = wss.getUniqueID();
    wssClientStorage[ws.id] = ws;
    ws.isAlive = true;
    ws.on("pong", function () {
      ws.isAlive = true;
    });

    ws.on("message", function incoming(message: WebSocket.Data) {
      const WsMsg: WSDataType = JSON.parse(message.toString());
      logger.info(`[WS] topic: ${WsMsg.topic}`);
      switch (WsMsg.topic) {
        case topic.CLIENT_TOKEN:
          ClientToken(ws, WsMsg.payload);
          break;
        case topic.REGISTER_CLIENT:
          registerClient(ws, WsMsg.payload);
          break;
        case topic.CLIENT_LOG:
          ClientLog(ws, WsMsg.payload);
          break;
      }
    });

    ws.on("close", function close() {
      logger.info(`close ${ws.id}`);
      delete wssClientStorage[ws.id];
    });
  });

  const interval = setInterval(function ping() {
    wss.clients.forEach(function each(ws: any) {
      if (ws.isAlive === false) {
        logger.info(`ws.isAlive: false ${ws.id}`);
        delete wssClientStorage[ws.id];
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping(function () {});
    });
  }, 30000);

  wss.on("close", function close() {
    logger.info("wss.on close");
    clearInterval(interval);
  });
};

export const SendMessageToClient = function (ws: any, message: any) {
  ws.send(JSON.stringify(message));
};
