import express from "express";
import { Client, Log } from "../models/db";
import status from "../constants/status";
import * as encryption from "../lib/encryption";
import * as globalVar from "../lib/global_var";
import { msleep, validateid } from "../utils/helper";
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

  // const clientid = Url.substring(Url.indexOf('clientid=') + 'clientid='.length, Url.length)
  const clientid = req.query.clientid.replace(/ /g, "+");

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

  let ClientidDecrypted: any;
  try {
    ClientidDecrypted = await encryption.decrypt(clientid);
  } catch {
    ret = {
      status: status.UNKNOWN,
      msg: "Wrong client id",
    };
    console.log("== ret", ret);
    return res.json(ret);
  }

  let client: any = await Client.findOne({ where: { clientid: ClientidDecrypted } });

  if (client === null) {
    ret = {
      status: status.UNKNOWN,
      msg: "Wrong client id",
    };
    return;
  }

  for (const i in logs) {
    if (logs[i].length === 0) {
      console.log(`length=0: logs[${i}] ${logs[i]}`);
      continue;
    }
    var log: any = new Log();
    log.client_id = client.clientid;
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
      globalVar.wssClientStorage[key].clientids.includes(ClientidDecrypted)
    ) {
      const newupdate = {
        command: "pushlog",
        db: "logs",
        // _id: log._id,
        // createdAt: log.createdAt,
        clientid: req.query.clientid,
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

  const payload = encryption.verifyToken(process.env.JWT_SECRET!, req);
  if (payload === null) {
    return res.json({
      status: status.ERROR,
      msg: "Token decode error",
      code: status.TOKEN_DECODE_ERROR,
    });
  }

  if (req.body.clientid === "" || req.body.clientid === undefined || req.body.clientid === null) {
    return res.json({
      status: status.UNKNOWN,
      msg: "Wrong client id",
    });
  }

  const ClientidDecrypted = await encryption.decrypt(req.body.clientid);
  const FindOptions: any = {
    client_id: ClientidDecrypted,
  };

  if (req.body.gt !== undefined && req.body.gt !== null) {
    FindOptions._id = { $gt: req.body.gt };
  }

  if (req.body.lt !== undefined && req.body.lt !== null) {
    FindOptions._id = { $lt: req.body.lt };
  }

  if (validateid(ClientidDecrypted)) {
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
      msg: "Wrong client id",
    });
  }
});

export = router;
