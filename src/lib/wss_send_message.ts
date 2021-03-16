import * as globalVar from "./global_var";
import * as wss from "../wss";

export async function SendBrowserByWsId(WsId: string, WssData: any) {
  for (const key in globalVar.wssClientStorage) {
    if (
      globalVar.wssClientStorage[key].user !== undefined &&
      globalVar.wssClientStorage[key].id === WsId
    ) {
      wss.SendMessageToClient(globalVar.wssClientStorage[key], WssData);
    }
  }
}

export async function SendBrowserByEmail(email: string, WssData: any) {
  for (const key in globalVar.wssClientStorage) {
    if (
      globalVar.wssClientStorage[key].user !== undefined &&
      globalVar.wssClientStorage[key].user.email === email
    ) {
      wss.SendMessageToClient(globalVar.wssClientStorage[key], WssData);
    }
  }
}

export function SendClientByClientId(ClientId: string, WssData: any) {
  for (const key in globalVar.wssClientStorage) {
    if (
      globalVar.wssClientStorage[key].clientId !== undefined &&
      globalVar.wssClientStorage[key].clientId === ClientId
    ) {
      wss.SendMessageToClient(globalVar.wssClientStorage[key], WssData);
    }
  }
}
