import * as globalVar from "./global_var";
import * as wss from "../wss";
import { Device } from "../models/db";

export async function sendBrowserClientId(ClientId: any, WssData: any) {
  console.log(ClientId);
  console.log(WssData);
  const device: any = await Device.findOne({ where: { deviceid: ClientId } });
  // for (const key in globalVar.wssClientStorage) {
  //   if (
  //     globalVar.wssClientStorage[key].user !== undefined &&
  //     globalVar.wssClientStorage[key].deviceids.includes(ClientId)
  //   ) {
  //     wss.SendMessageToClient(globalVar.wssClientStorage[key], WssData);
  //   }
  // }
}

export function sendBrowserEmail(email: any, WssData: any) {
  for (const key in globalVar.wssClientStorage) {
    if (
      globalVar.wssClientStorage[key].token !== undefined &&
      globalVar.wssClientStorage[key].email === email &&
      globalVar.wssClientStorage[key].device === undefined
    ) {
      wss.SendMessageToClient(globalVar.wssClientStorage[key], WssData);
    }
  }
}

export function sendDevice(deviceid: any, WssData: any) {
  for (const key in globalVar.wssClientStorage) {
    if (
      globalVar.wssClientStorage[key].device !== undefined &&
      globalVar.wssClientStorage[key].device === deviceid
    ) {
      wss.SendMessageToClient(globalVar.wssClientStorage[key], WssData);
    }
  }
}
