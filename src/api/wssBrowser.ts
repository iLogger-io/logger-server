import * as crypto from "../lib/crypto";
import * as jwt from "../lib/jwt";

function verifytoken(_token: string | undefined | null, ws: any) {
  if (_token === null || _token === undefined || _token === "") {
    return;
  }
  const token: any = jwt.verifyTokenRaw(_token);
  ws.token = token;
  ws.email = token.email;
  ws.deviceids = [];
}

async function registerDeviceID(deviceid: string, ws: any) {
  const DeviceidDecrypted = await crypto.decrypt(deviceid);
  if (!ws.deviceids.includes(DeviceidDecrypted)) {
    ws.deviceids.push(DeviceidDecrypted);
  }
}

const wsrouter = function (parseMsg: any, ws: any) {
  if (parseMsg.path !== "/token" && ws.token === undefined) {
    return;
  }

  switch (parseMsg.path) {
    case "/token":
      verifytoken(parseMsg.token, ws);
      break;

    case "/registerDeviceID":
      registerDeviceID(parseMsg.deviceid, ws);
      break;
  }
};

export = wsrouter;
