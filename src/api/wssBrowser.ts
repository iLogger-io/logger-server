import * as crypto from "../lib/crypto";
import * as jwt from "../lib/encryption";

function verifytoken(_token: string | undefined | null, ws: any) {
  // if (_token === null || _token === undefined || _token === "") {
  //   return;
  // }
  // const token: any = jwt.verifyTokenRaw(_token);
  // ws.token = token;
  // ws.email = token.email;
  // ws.clientids = [];
}

async function registerClientID(clientid: string, ws: any) {
  const ClientidDecrypted = await crypto.decrypt(clientid);
  if (!ws.clientids.includes(ClientidDecrypted)) {
    ws.clientids.push(ClientidDecrypted);
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

    case "/registerClientID":
      registerClientID(parseMsg.clientid, ws);
      break;
  }
};

export = wsrouter;
