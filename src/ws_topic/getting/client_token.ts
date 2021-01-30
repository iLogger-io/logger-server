import WebSocket from "ws";
import * as encryption from "../../lib/encryption";
import { wssClientStorage } from "../../lib/global_var";

export = function ClientToken(ws: WebSocket, payload: any) {
  const jwtPayload = encryption.jwtDecode(payload.token, process.env.JWT_SECRET!);
  if (jwtPayload === null) {
    delete wssClientStorage[(ws as any).id];
    ws.terminate();
  } else {
    (ws as any).user = jwtPayload;
  }
};
