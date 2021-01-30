import WebSocket from "ws";
import logger from "../../utils/logger";
import * as encryption from "../../lib/encryption";
import { wssClientStorage } from "../../lib/global_var";
import { Device } from "../../models/db";

export = async function registerClient(ws: WebSocket, payload: any) {
  const ClientIdDecrypted = await encryption.decrypt(payload.clientid);

  if (encryption.validateId(ClientIdDecrypted)) {
    const device = await Device.findOne({ where: { deviceid: ClientIdDecrypted } });
    if (device === null) {
      logger.error(`[registerClient] Wrong client id`);
      delete wssClientStorage[(ws as any).id];
      ws.terminate();
    } else {
      (ws as any).clientId = ClientIdDecrypted;
    }
  } else {
    logger.error(`[registerClient] Wrong client id`);
  }
};
