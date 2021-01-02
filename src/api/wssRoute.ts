import wssBrowser from "./wssBrowser";
import wssDevice from "./wssDevice";

const wsrouter = function (parseMsg: any, ws: any) {
  console.log(parseMsg);
  if (parseMsg.path === "/token" || parseMsg.path === "/registerDeviceID") {
    wssBrowser(parseMsg, ws);
  } else if (
    parseMsg.path === "/DeviceSendData" ||
    parseMsg.path === "/DeviceSendDataIoT" ||
    parseMsg.path === "/registerDevice"
  ) {
    wssDevice(parseMsg, ws);
  }
};

export = wsrouter;
