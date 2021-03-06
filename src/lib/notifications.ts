import status from "../constants/status";
import { Notification } from "../models/db";
import * as wssSendMessage from "./wss_send_message";

export const type = {
  USER: 0,
  ERROR: 1,
  WARNING: 2,
  MATCHCASE: 3,
  REGEX: 4,
};

export function save(email: any, type: any, data: any) {
  return new Promise(async (resolve, reject) => {
    let ret: any = {
      status: status.SUCCESS,
      msg: "OK",
    };

    data.type = type;
    const notification = new Notification();
    notification.email = email;
    notification.messages = JSON.stringify(data);
    await notification.save();

    ret = {
      status: status.SUCCESS,
      msg: "Save notification successfully",
      id: notification.id,
    };
    resolve(ret);
    return ret;
  });
}

export async function push(id: any, clientid: any) {
  let ret = {
    status: status.SUCCESS,
    msg: "OK",
  };
  const notification = await Notification.findOne({ where: { id: id } });
  if (notification === null) {
    ret = {
      status: status.UNKNOWN,
      msg: "id not found",
    };
    console.log(ret);
    return ret;
  }
  const wssData = {
    command: "pushNotification",
    messages: JSON.parse(notification.messages),
    clientid: clientid,
  };
  wssSendMessage.SendBrowserWithEmail(notification.email, wssData);
  return ret;
}
