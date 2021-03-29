import WebSocket from "ws";
import logger from "../../utils/logger";
import { User, Client, Log } from "../../models/db";
import * as notiController from "../../lib/notifications";
import status from "../../constants/status";
import { msleep } from "../../utils/helper";
import * as mail from "../../utils/mail";
import * as WssSendMessage from "../../lib/wss_send_message";
import { WSDataType } from "../../types/index";
import * as encryption from "../../lib/encryption";
import { Level } from "../../types/enum";

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

export = async function ClientLog(ws: WebSocket, payload: any) {
  let ret: any = {
    status: status.SUCCESS,
  };

  if ((ws as any).clientId === undefined) {
    logger.error(`[ClientLog] Client id isn't yet registered`);
    return;
  }

  let StringData = payload.data;
  StringData = StringData.replace(/\r\n/g, "\n");
  StringData = StringData.replace(/\n\r/g, "\n");
  StringData = StringData.replace(/\r/g, "\n");
  let logs: (string | undefined)[] = StringData.split("\n");
  if ((ws as any).dataLogRemain !== undefined && (ws as any).dataLogRemain !== null) {
    logs[0] = (ws as any).dataLogRemain + logs[0];
    (ws as any).dataLogRemain = null;
  }

  if (logs[logs.length - 1] !== "") {
    (ws as any).dataLogRemain = logs[logs.length - 1];
  }
  logs.pop();

  /* Convert multiple space "   " to "" */
  logs = logs.map((str) => {
    const countSpace = (str!.match(/ /g) || []).length;
    if (countSpace === str!.length) {
      logger.warn("Space log");
      return "";
    } else {
      return str;
    }
  });

  /* Remove space in logs */
  logs = logs.filter((i) => i !== " ");
  logs = logs.filter((i) => i !== "");

  if (logs.length === 0) {
    return;
  }

  const client: any = await Client.findOne({
    where: { clientid: (ws as any).clientId },
    include: [{ model: User, as: "user" }],
  });

  const ClientSettings = JSON.parse(client.settings);
  for (let i in logs) {
    var log: any = new Log();
    log.client_id = client.clientid;
    log.log = logs[i];
    log.level = Level.NORMAL;
    await log.save(async function (err: any, _log: any) {
      if (err) {
        console.log(err.code);
        ret = {
          status: status.ERROR,
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
      const notiRet: any = await notiController.save(client.user.id, client.email, type, {
        msg: `Found ${TriggerEvents.Event}`,
        data: logs[i],
      });
      notiController.push(notiRet.id, (ws as any).clientId);
      if (ClientSettings.PushNotifications.Email) {
        const content = `
        <h2 style="padding-left: 30px;">Found&nbsp; ${TriggerEvents.Event}</h2>
        <ul>
        <li>Client id: ${(ws as any).clientId}</li>
        <li>log: ${log.log}</li>
        <li>datetime: ${log.createdAt}</li>
        </ul>`;
        logger.warn("iLogger Notifications");
        logger.warn(TriggerEvents.Event);
        mail.send(client.email, "iLogger Notifications", content);
      }
    }
    await msleep(2);
  }
  const wssData: WSDataType = {
    topic: "pushlog",
    payload: {
      logId: log._id,
      ClientId: await encryption.encrypt((ws as any).clientId),
    },
  };

  WssSendMessage.SendBrowserByEmail(client.email, wssData);

  ret = {
    status: status.SUCCESS,
    msg: "Push log successfully",
  };
  return ret;
};
