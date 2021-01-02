import express from "express";
const router = express.Router();
import status from "../lib/status";
import { Device } from "../lib/db";
import Log from "../models/Logs";

import * as jwttoken from "../lib/token";
import * as encryption from "../lib/encryption";
import * as notiController from "../controllers/notifications";
import * as wssSendMessage from "../controllers/wssSendMessage";

router.post("/register", async function (req, res) {
  const Url = req.protocol + "://" + req.get("host") + req.originalUrl;
  console.log("Url", Url);

  const token = jwttoken.verifyToken(req);
  if (token === null) {
    return res.json({
      status: status.UNKNOWN,
      msg: "Token has expired",
    });
  }

  const deviceid = encryption.genid();

  var device = new Device();
  device.email = token.email;
  device.deviceid = deviceid;
  device.name = req.body.name;

  await device.save();
  const notiRet = await notiController.save(token.email, notiController.type.USER, {
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

  const token = jwttoken.verifyToken(req);
  if (token === null) {
    return res.json({
      status: status.UNKNOWN,
      msg: "Token has expired",
    });
  }

  if (req.body.deviceid === "" || req.body.deviceid === undefined || req.body.deviceid === null) {
    return res.json({
      status: status.UNKNOWN,
      msg: "Wrong device id",
    });
  }
  const DeviceidDecrypted = await encryption.decrypt(req.body.deviceid);

  if (encryption.validateid(DeviceidDecrypted)) {
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

  const token = jwttoken.verifyToken(req);
  if (token === null) {
    return res.json({
      status: status.UNKNOWN,
      msg: "Token has expired",
    });
  }

  Device.findAll({
    where: { email: token.email },
    order: [["createdAt", "ASC"]],
  }).then(async (devices) => {
    const devicelists = [];
    for (let i = 0; i < devices.length; i++) {
      devicelists.push({
        name: devices[i].name,
        id: await encryption.encrypt(devices[i].deviceid),
      });
    }
    return res.json({
      status: status.SUCCESS,
      msg: "List device successfully",
      list: devicelists,
    });
  });
});

router.post("/settings", async function (req, res) {
  const Url = req.protocol + "://" + req.get("host") + req.originalUrl;
  console.log("Url", Url);

  var ret = {
    status: status.SUCCESS,
    msg: "OK",
  };

  const token = jwttoken.verifyToken(req);
  if (token === null) {
    return res.json({
      status: status.UNKNOWN,
      msg: "Token has expired",
    });
  }

  if (req.body.deviceid === "" || req.body.deviceid === undefined || req.body.deviceid === null) {
    return res.json({
      status: status.UNKNOWN,
      msg: "Wrong device id",
    });
  }
  const DeviceidDecrypted = await encryption.decrypt(req.body.deviceid);

  if (encryption.validateid(DeviceidDecrypted)) {
    const device = await Device.findOne({ where: { deviceid: DeviceidDecrypted } });

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

  const token = jwttoken.verifyToken(req);
  if (token === null) {
    return res.json({
      status: status.UNKNOWN,
      msg: "Token has expired",
    });
  }

  if (req.body.deviceid === "" || req.body.deviceid === undefined || req.body.deviceid === null) {
    return res.json({
      status: status.UNKNOWN,
      msg: "Wrong device id",
    });
  }
  const DeviceidDecrypted = await encryption.decrypt(req.body.deviceid);

  if (encryption.validateid(DeviceidDecrypted)) {
    const device = await Device.findOne({ where: { deviceid: DeviceidDecrypted } });

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

  const token = jwttoken.verifyToken(req);
  if (token === null) {
    return res.json({
      status: status.UNKNOWN,
      msg: "Token has expired",
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

  let device;
  await Device.findOne({ deviceid: DeviceidDecrypted }, async function (err, _device) {
    if (err) {
      console.log(err.code);
      ret = {
        status: status.UNKNOWN,
        msg: err.message,
      };
      return ret;
    }

    device = _device;
    return device;
  });

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

  const token = jwttoken.verifyToken(req);
  if (token === null) {
    return res.json({
      status: status.UNKNOWN,
      msg: "Token has expired",
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

  let device;
  await Device.findOne({ deviceid: DeviceidDecrypted }, async function (err, _device) {
    if (err) {
      console.log(err.code);
      ret = {
        status: status.UNKNOWN,
        msg: err.message,
      };
      return ret;
    }

    device = _device;
    return device;
  });

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

module.exports = router;
