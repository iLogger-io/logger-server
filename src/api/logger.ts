import express from "express";
import { Device } from "../lib/db";
import Log from "../models/Logs";
import status from "../lib/status";
import * as encryption from "../lib/encryption";
import * as jwttoken from "../lib/token";
import * as globalVar from "../lib/globalVar";
import { msleep } from "../lib/helper";
import * as wss from "../wss";

const router = express.Router();

function GetBody(req: any) {
  return new Promise((resolve, reject) => {
    var body = "";
    req.on("data", (chunk: any) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      resolve(body);
    });
  });
}

router.post("/data", async function (req: any, res) {
  const Url = req.protocol + "://" + req.get("host") + req.originalUrl;
  console.log("Url", Url);

  // const deviceid = Url.substring(Url.indexOf('deviceid=') + 'deviceid='.length, Url.length)
  const deviceid = req.query.deviceid.replace(/ /g, "+");

  let ret: any = {
    status: status.SUCCESS,
    msg: "OK",
  };
  let bodylog: any;
  if (req.headers["content-type"] !== "application/octet-stream") {
    bodylog = await GetBody(req);
  }

  const logs: any = bodylog.split("\n");

  // for (const i in logs) {
  //   logs[i] = logs[i].replace(/\\r/g, '')
  // }

  let DeviceidDecrypted: any;
  try {
    DeviceidDecrypted = await encryption.decrypt(deviceid);
  } catch {
    ret = {
      status: status.UNKNOWN,
      msg: "Wrong device id",
    };
    console.log("== ret", ret);
    return res.json(ret);
  }

  let device: any = await Device.findOne({ where: { deviceid: DeviceidDecrypted } });

  if (device === null) {
    ret = {
      status: status.UNKNOWN,
      msg: "Wrong device id",
    };
    return;
  }

  for (const i in logs) {
    if (logs[i].length === 0) {
      console.log(`length=0: logs[${i}] ${logs[i]}`);
      continue;
    }
    var log: any = new Log();
    log.deviceid = device.deviceid;
    log.log = logs[i];
    log.save(async function (err: any, log: any) {
      if (err) {
        console.log(err.code);
        ret = {
          status: status.UNKNOWN,
          msg: err.message,
        };
      }
    });
    if (ret.status !== status.SUCCESS) {
      return;
    }
    await msleep(1);
  }
  for (const key in globalVar.wssClientStorage) {
    if (
      globalVar.wssClientStorage[key].token !== undefined &&
      globalVar.wssClientStorage[key].deviceids.includes(DeviceidDecrypted)
    ) {
      const newupdate = {
        command: "pushlog",
        db: "logs",
        // _id: log._id,
        // createdAt: log.createdAt,
        deviceid: req.query.deviceid,
      };
      wss.SendMessageToClient(globalVar.wssClientStorage[key], newupdate);
    }
  }
  ret = {
    status: status.SUCCESS,
    msg: "Push log successfully",
  };
  return res.json(ret);
});

router.post("/getlog", async function (req, res) {
  const Url = req.protocol + "://" + req.get("host") + req.originalUrl;
  console.log("Url", Url);

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
  const FindOptions: any = {
    deviceid: DeviceidDecrypted,
  };

  if (req.body.gt !== undefined && req.body.gt !== null) {
    FindOptions._id = { $gt: req.body.gt };
  }

  if (req.body.lt !== undefined && req.body.lt !== null) {
    FindOptions._id = { $lt: req.body.lt };
  }

  if (encryption.validateid(DeviceidDecrypted)) {
    Log.find(FindOptions, async function (err, logs: any) {
      if (err) {
        console.log(err.code);
        return res.json({
          status: status.UNKNOWN,
          msg: err.message,
        });
      }
      const retlogs = [];
      /* Reverse output */
      for (let i = logs.length - 1; i >= 0; i--) {
        retlogs.push({
          _id: logs[i]._id,
          time: logs[i].createdAt,
          log: logs[i].log,
        });
      }
      return res.json({
        status: status.SUCCESS,
        msg: "Get logs successfully",
        logs: retlogs,
      });
    })
      .sort({ createdAt: -1 })
      .limit(100);
  } else {
    return res.json({
      status: status.UNKNOWN,
      msg: "Wrong device id",
    });
  }
});

export = router;
