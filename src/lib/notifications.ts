import status from "../constants/status";
import { Notification } from "../models/db";
import * as wssSendMessage from "./wss_send_message";
import * as encryption from "../lib/encryption";

export const type = {
  USER: 0,
  ERROR: 1,
  WARNING: 2,
  MATCHCASE: 3,
  REGEX: 4,
};

export function save(userId: number, email: any, type: any, data: any) {
  return new Promise(async (resolve, reject) => {
    let ret: any = {
      status: status.SUCCESS,
      msg: "OK",
    };

    data.type = type;
    const notification = new Notification();
    notification.email = email;
    notification.messages = JSON.stringify(data);
    notification.user_id = userId;
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
    return ret;
  }
  const wssData = {
    topic: "push_notification",
    payload: {
      ClientId: await encryption.encrypt(clientid),
      messages: JSON.parse(notification.messages!),
    },
  };
  wssSendMessage.SendBrowserByEmail(notification.email!, wssData);
  return ret;
}
