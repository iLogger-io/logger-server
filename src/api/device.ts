import express from "express";
const router = express.Router();
import status from "../constants/status";
import { Device, Log } from "../models/db";

import * as encryption from "../lib/encryption";
import logger from "../utils/logger";
import { genid, validateid } from "../utils/helper";
import * as notiController from "../lib/notifications";
import * as wssSendMessage from "../lib/wss_send_message";
import { ResStt } from "../types/index";

router.post("/register", async function (req, res) {
  const Url = req.protocol + "://" + req.get("host") + req.originalUrl;
  console.log("Url", Url);

  const payload = encryption.verifyToken(process.env.JWT_SECRET!, req);
  if (payload === null) {
    return res.json({
      status: status.ERROR,
      msg: "Token decode error",
      code: status.TOKEN_DECODE_ERROR,
    });
  }

  const deviceid = genid();

  const device: any = new Device();
  device.email = payload.email;
  device.deviceid = deviceid;
  device.name = req.body.name;

  await device.save();
  const notiRet: any = await notiController.save(payload.email, notiController.type.USER, {
    msg: "Register device successfully",
  });
  notiController.push(notiRet.id, null);
  return res.json({
    status: status.SUCCESS,
    msg: "Register device successfully",
    deviceid: await encryption.encrypt(device.deviceid),
  });
});

router.post("/remove", async function (req, res) {
  const Url = req.protocol + "://" + req.get("host") + req.originalUrl;
  console.log("Url", Url);

  var ret = {
    status: status.SUCCESS,
    msg: "OK",
  };

  const payload = encryption.verifyToken(process.env.JWT_SECRET!, req);
  if (payload === null) {
    return res.json({
      status: status.ERROR,
      msg: "Token decode error",
      code: status.TOKEN_DECODE_ERROR,
    });
  }

  if (req.body.deviceid === "" || req.body.deviceid === undefined || req.body.deviceid === null) {
    return res.json({
      status: status.UNKNOWN,
      msg: "Wrong device id",
    });
  }
  const DeviceidDecrypted = await encryption.decrypt(req.body.deviceid);

  if (validateid(DeviceidDecrypted)) {
    await Device.destroy({ where: { deviceid: DeviceidDecrypted } });

    if (ret.status !== status.SUCCESS) {
      return res.json(ret);
    }

    await Log.deleteMany({ deviceid: DeviceidDecrypted }, function (err) {
      if (err) {
        console.log(err.code);
        ret = {
          status: status.UNKNOWN,
          msg: err.message,
        };
      }
    });

    if (ret.status !== status.SUCCESS) {
      return res.json(ret);
    }

    return res.json({
      status: status.SUCCESS,
      msg: "Remove device successfully",
    });
  } else {
    return res.json({
      status: status.UNKNOWN,
      msg: "Wrong device id",
    });
  }
});

router.get("/list", async function (req, res) {
  const Url = req.protocol + "://" + req.get("host") + req.originalUrl;
  console.log("Url", Url);

  let resStt: ResStt = {
    status: status.SUCCESS,
    msg: "List device successfully",
    payload: { list: [] },
  };

  const payload = encryption.verifyToken(process.env.JWT_SECRET!, req);
  if (payload === null) {
    return res.json({
      status: status.ERROR,
      msg: "Token decode error",
      code: status.TOKEN_DECODE_ERROR,
    });
  }

  const devices: any = await Device.findAll({
    where: { email: payload.email },
    order: [["createdAt", "ASC"]],
  });

  for (let i in devices) {
    resStt.payload.list.push({
      name: devices[i].name,
      id: await encryption.encrypt(devices[i].deviceid),
    });
  }

  return res.json(resStt);
});

router.post("/settings", async function (req, res) {
  const Url = req.protocol + "://" + req.get("host") + req.originalUrl;
  console.log("Url", Url);

  var ret = {
    status: status.SUCCESS,
    msg: "OK",
  };

  const payload = encryption.verifyToken(process.env.JWT_SECRET!, req);
  if (payload === null) {
    return res.json({
      status: status.ERROR,
      msg: "Token decode error",
      code: status.TOKEN_DECODE_ERROR,
    });
  }

  if (req.body.deviceid === "" || req.body.deviceid === undefined || req.body.deviceid === null) {
    return res.json({
      status: status.UNKNOWN,
      msg: "Wrong device id",
    });
  }
  const DeviceidDecrypted = await encryption.decrypt(req.body.deviceid);

  if (validateid(DeviceidDecrypted)) {
    const device: any = await Device.findOne({ where: { deviceid: DeviceidDecrypted } });

    if (ret.status !== status.SUCCESS) {
      return res.json(ret);
    }

    return res.json({
      status: status.SUCCESS,
      msg: "Load settings successfully",
      settings: JSON.parse(device.settings),
    });
  } else {
    return res.json({
      status: status.UNKNOWN,
      msg: "Wrong device id",
    });
  }
});

router.post("/savesettings", async function (req, res) {
  const Url = req.protocol + "://" + req.get("host") + req.originalUrl;
  console.log("Url", Url);

  var ret = {
    status: status.SUCCESS,
    msg: "OK",
  };

  const payload = encryption.verifyToken(process.env.JWT_SECRET!, req);
  if (payload === null) {
    return res.json({
      status: status.ERROR,
      msg: "Token decode error",
      code: status.TOKEN_DECODE_ERROR,
    });
  }

  if (req.body.deviceid === "" || req.body.deviceid === undefined || req.body.deviceid === null) {
    return res.json({
      status: status.UNKNOWN,
      msg: "Wrong device id",
    });
  }
  const DeviceidDecrypted = await encryption.decrypt(req.body.deviceid);

  if (validateid(DeviceidDecrypted)) {
    const device: any = await Device.findOne({ where: { deviceid: DeviceidDecrypted } });

    if (ret.status !== status.SUCCESS) {
      return res.json(ret);
    }

    device.settings = JSON.stringify(req.body.settings);
    await device.save();

    return res.json({
      status: status.SUCCESS,
      msg: "Save settings successfully",
    });
  } else {
    return res.json({
      status: status.UNKNOWN,
      msg: "Wrong device id",
    });
  }
});

router.post("/sendcommand", async function (req, res) {
  const Url = req.protocol + "://" + req.get("host") + req.originalUrl;
  console.log("Url", Url);

  var ret = {
    status: status.SUCCESS,
    msg: "OK",
  };

  const payload = encryption.verifyToken(process.env.JWT_SECRET!, req);
  if (payload === null) {
    return res.json({
      status: status.ERROR,
      msg: "Token decode error",
      code: status.TOKEN_DECODE_ERROR,
    });
  }

  var DeviceidDecrypted;
  try {
    DeviceidDecrypted = await encryption.decrypt(req.body.deviceid);
  } catch {
    ret = {
      status: status.UNKNOWN,
      msg: "Wrong device id",
    };
    console.log(ret);
    return res.json(ret);
  }

  let device = await Device.findOne({ where: { deviceid: DeviceidDecrypted } });

  if (ret.status !== status.SUCCESS) {
    console.log(ret);
    return res.json(ret);
  }

  if (device === null) {
    ret = {
      status: status.UNKNOWN,
      msg: "Wrong device id",
    };
    console.log(ret);
    return res.json(ret);
  }

  const wssdata = {
    command: "command",
    type: req.body.command,
  };
  wssSendMessage.sendDevice(req.body.deviceid, wssdata);

  return res.json({
    status: status.SUCCESS,
    msg: "Send command to device successfully",
  });
});

router.post("/sendcommandline", async function (req, res) {
  const Url = req.protocol + "://" + req.get("host") + req.originalUrl;
  console.log("Url", Url);

  var ret = {
    status: status.SUCCESS,
    msg: "OK",
  };

  const payload = encryption.verifyToken(process.env.JWT_SECRET!, req);
  if (payload === null) {
    return res.json({
      status: status.ERROR,
      msg: "Token decode error",
      code: status.TOKEN_DECODE_ERROR,
    });
  }

  var DeviceidDecrypted;
  try {
    DeviceidDecrypted = await encryption.decrypt(req.body.deviceid);
  } catch {
    ret = {
      status: status.UNKNOWN,
      msg: "Wrong device id",
    };
    console.log(ret);
    return res.json(ret);
  }

  let device = await Device.findOne({ where: { deviceid: DeviceidDecrypted } });

  if (ret.status !== status.SUCCESS) {
    console.log(ret);
    return res.json(ret);
  }

  if (device === null) {
    ret = {
      status: status.UNKNOWN,
      msg: "Wrong device id",
    };
    console.log(ret);
    return res.json(ret);
  }

  console.log("string", req.body.string);
  const wssdata = {
    command: "commandline",
    string: req.body.string,
  };
  wssSendMessage.sendDevice(req.body.deviceid, wssdata);

  return res.json({
    status: status.SUCCESS,
    msg: "Send command line to device successfully",
  });
});

export = router;
