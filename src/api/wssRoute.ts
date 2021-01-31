import wssBrowser from "./wssBrowser";
import wssClient from "./wssClient";

const wsrouter = function (parseMsg: any, ws: any) {
  console.log(parseMsg);
  if (parseMsg.path === "/token" || parseMsg.path === "/registerClientID") {
    wssBrowser(parseMsg, ws);
  } else if (
    parseMsg.path === "/ClientSendData" ||
    parseMsg.path === "/ClientSendDataIoT" ||
    parseMsg.path === "/registerClient"
  ) {
    wssClient(parseMsg, ws);
  }
};

export = wsrouter;
