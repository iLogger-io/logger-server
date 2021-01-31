import * as globalVar from "./global_var";
import * as wss from "../wss";

export async function SendBrowserWithWsId(WsId: string, WssData: any) {
  for (const key in globalVar.wssClientStorage) {
    if (
      globalVar.wssClientStorage[key].user !== undefined &&
      globalVar.wssClientStorage[key].id === WsId
    ) {
      wss.SendMessageToClient(globalVar.wssClientStorage[key], WssData);
    }
  }
}

export async function SendBrowserWithEmail(email: string, WssData: any) {
  for (const key in globalVar.wssClientStorage) {
    if (
      globalVar.wssClientStorage[key].user !== undefined &&
      globalVar.wssClientStorage[key].user.email === email
    ) {
      wss.SendMessageToClient(globalVar.wssClientStorage[key], WssData);
    }
  }
}

export function SendClientWithClientId(ClientId: string, WssData: any) {
  for (const key in globalVar.wssClientStorage) {
    if (
      globalVar.wssClientStorage[key].clientId !== undefined &&
      globalVar.wssClientStorage[key].clientId === ClientId
    ) {
      wss.SendMessageToClient(globalVar.wssClientStorage[key], WssData);
    }
  }
}
