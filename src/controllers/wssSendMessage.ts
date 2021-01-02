import * as globalVar from "../lib/globalVar";
import * as wss from "../wss";

export function sendBrowserDeviceid(deviceid: any, wssdata: any) {
  for (const key in globalVar.wssClientStorage) {
    if (
      globalVar.wssClientStorage[key].token !== undefined &&
      globalVar.wssClientStorage[key].deviceids.includes(deviceid)
    ) {
      wss.SendMessageToClient(globalVar.wssClientStorage[key], wssdata);
    }
  }
}

export function sendBrowserEmail(email: any, wssdata: any) {
  for (const key in globalVar.wssClientStorage) {
    if (
      globalVar.wssClientStorage[key].token !== undefined &&
      globalVar.wssClientStorage[key].email === email &&
      globalVar.wssClientStorage[key].device === undefined
    ) {
      wss.SendMessageToClient(globalVar.wssClientStorage[key], wssdata);
    }
  }
}

export function sendDevice(deviceid: any, wssdata: any) {
  for (const key in globalVar.wssClientStorage) {
    if (
      globalVar.wssClientStorage[key].device !== undefined &&
      globalVar.wssClientStorage[key].device === deviceid
    ) {
      wss.SendMessageToClient(globalVar.wssClientStorage[key], wssdata);
    }
  }
}
