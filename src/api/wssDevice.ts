import * as crypto from "../lib/crypto";
import status from "../constants/status";
import { msleep } from "../utils/helper";
import { Client, Log } from "../models/db";
import * as wssSendMessage from "../lib/wss_send_message";
import * as globalVar from "../lib/globalVar";
import * as notiController from "../lib/notifications";
import * as mail from "../utils/mail";
import { validateid } from "../utils/helper";

function EventChecking(log: any, TriggerEventSettings: any) {
  for (const key in TriggerEventSettings) {
    if (TriggerEventSettings[key] !== false && TriggerEventSettings[key] !== "") {
      switch (key) {
        case "ErrorLog": {
          const RedCode = ["[0;31m", "[1;31m"];
          for (const i in RedCode) {
            if (log.indexOf(RedCode[i]) >= 0) {
              return { Event: key };
            }
          }
          break;
        }
        case "WarningLog": {
          const YellowCode = ["[0;33m", "[01;33m"];
          for (const i in YellowCode) {
            if (log.indexOf(YellowCode[i]) >= 0) {
              return { Event: key };
            }
          }
          break;
        }
        case "Matchcase":
          if (log.indexOf(TriggerEventSettings[key]) >= 0) {
            return { Event: key };
          }
          break;
        case "Regex": {
          const regex = new RegExp(TriggerEventSettings[key], "g");
          const match = log.match(regex);
          if (match !== null) {
            return { Event: key };
          }
          break;
        }
      }
    }
  }
  return false;
}

async function ClientSendData(parseMsg: any, ws: any) {
  console.log("Path", parseMsg.path);

  var ret = {
    status: status.SUCCESS,
    msg: "OK",
  };

  let StringData = ws.dataBuf;
  StringData = StringData.replace(/\r\n/g, "\n");
  StringData = StringData.replace(/\n\r/g, "\n");
  StringData = StringData.replace(/\r/g, "\n");
  var logs: string[] = StringData.split("\n");

  if (ws.dataLogRemain !== undefined && ws.dataLogRemain !== null) {
    logs[0] = ws.dataLogRemain + logs[0];
    ws.dataLogRemain = null;
  }

  if (logs[logs.length - 1] !== "") {
    ws.dataLogRemain = logs[logs.length - 1];
  }
  logs.pop();

  if (logs.length === 1 && logs[0] === "") {
    console.log("Space log");
  }

  /* Remove space in logs */
  logs = logs.filter((i) => i !== " ");
  logs = logs.filter((i) => i !== "");
  console.log("logs", logs);

  if (logs.length === 0) {
    return;
  }

  var ClientidDecrypted;
  try {
    ClientidDecrypted = await crypto.decrypt(parseMsg.clientid);
  } catch {
    ret = {
      status: status.UNKNOWN,
      msg: "Wrong client id",
    };
    console.log(ret);
    return;
  }

  const client: any = await Client.findOne({ where: { clientid: ClientidDecrypted } });

  if (ret.status !== status.SUCCESS) {
    console.log(ret);
    return;
  }

  if (client === null) {
    ret = {
      status: status.UNKNOWN,
      msg: "Wrong client id",
    };
    console.log(ret);
    return;
  }

  const ClientSettings = JSON.parse(client.settings);
  let checkSaveLog = false;
  for (const i in logs) {
    if (logs[i].length === 0) {
      continue;
    }

    checkSaveLog = true;
    var log: any = new Log();
    log.clientid = client.clientid;
    log.log = logs[i];
    await log.save(async function (err: any, _log: any) {
      if (err) {
        console.log(err.code);
        ret = {
          status: status.UNKNOWN,
          msg: err.message,
        };
      }
      log = _log;
    });
    if (ret.status !== status.SUCCESS) {
      return;
    }

    const TriggerEvents = EventChecking(logs[i], ClientSettings.TriggerEvents);
    if (TriggerEvents !== false) {
      let type;
      switch (TriggerEvents.Event) {
        case "ErrorLog":
          type = notiController.type.ERROR;
          break;
        case "WarningLog":
          type = notiController.type.WARNING;
          break;
        case "Matchcase":
          type = notiController.type.MATCHCASE;
          break;
        case "Regex":
          type = notiController.type.REGEX;
          break;
      }
      const notiRet: any = await notiController.save(client.email, type, {
        msg: `Found ${TriggerEvents.Event}`,
        data: logs[i],
      });
      notiController.push(notiRet.id, parseMsg.clientid);
      if (ClientSettings.PushNotifications.Email) {
        const content = `
        <h2 style="padding-left: 30px;">Found&nbsp; ${TriggerEvents.Event}</h2>
        <ul>
        <li>Client id: ${parseMsg.clientid}</li>
        <li>log: ${log.log}</li>
        <li>datetime: ${log.createdAt}</li>
        </ul>`;
        mail.send(client.email, "iLogger Notifications", content);
      }
    }
    await msleep(2);
  }
  if (checkSaveLog) {
    const newupdate = {
      command: "pushlog",
      db: "logs",
      // _id: log._id,
      // createdAt: log.createdAt,
      clientid: parseMsg.clientid,
    };
    wssSendMessage.sendBrowserClientid(ClientidDecrypted, newupdate);
    ret = {
      status: status.SUCCESS,
      msg: "Push log successfully",
    };
    console.log(ret);
    return ret;
  }
}

async function registerClient(clientid: any, ws: any) {
  const ClientidDecrypted = await crypto.decrypt(clientid);
  var ret = {
    status: status.SUCCESS,
    msg: "OK",
  };
  if (validateid(ClientidDecrypted)) {
    const client = await Client.findOne({ where: { clientid: ClientidDecrypted } });

    if (client === null) {
      ret = {
        status: status.UNKNOWN,
        msg: "Wrong client id",
      };
      delete globalVar.wssClientStorage[ws.id];
      ws.terminate();
      return console.log(ret);
    }

    ws.client = clientid;

    return console.log({
      status: status.SUCCESS,
      msg: "Register client successfully",
    });
  }
}

const wsrouter = function (parseMsg: any, ws: any) {
  switch (parseMsg.path) {
    case "/ClientSendData":
      ws.dataBuf = parseMsg.data;
      ClientSendData(parseMsg, ws);
      break;
    case "/ClientSendDataIoT":
      ClientSendData(parseMsg, ws);
      break;
    case "/registerClient":
      registerClient(parseMsg.clientid, ws);
      break;
  }
};

export = wsrouter;
