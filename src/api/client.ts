import express from "express";
const router = express.Router();
import status from "../constants/status";
import { User, Client, Log } from "../models/db";

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

  const user: any = await User.findOne({ where: { email: payload.email } });

  const clientid = genid();

  const client: any = new Client();
  client.email = payload.email;
  client.clientid = clientid;
  client.name = req.body.name;
  client.user_id = user.id;

  await client.save();
  const notiRet: any = await notiController.save(user.id, payload.email, notiController.type.USER, {
    msg: "Register client successfully",
  });
  notiController.push(notiRet.id, null);
  return res.json({
    status: status.SUCCESS,
    msg: "Register client successfully",
    clientid: await encryption.encrypt(client.clientid),
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

  if (req.body.clientid === "" || req.body.clientid === undefined || req.body.clientid === null) {
    return res.json({
      status: status.UNKNOWN,
      msg: "Wrong client id",
    });
  }
  const ClientidDecrypted = await encryption.decrypt(req.body.clientid);

  if (validateid(ClientidDecrypted)) {
    await Client.destroy({ where: { clientid: ClientidDecrypted } });

    if (ret.status !== status.SUCCESS) {
      return res.json(ret);
    }

    await Log.deleteMany({ client_id: ClientidDecrypted }, function (err) {
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
      msg: "Remove client successfully",
    });
  } else {
    return res.json({
      status: status.UNKNOWN,
      msg: "Wrong client id",
    });
  }
});

router.get("/list", async function (req, res) {
  const Url = req.protocol + "://" + req.get("host") + req.originalUrl;
  console.log("Url", Url);

  let resStt: ResStt = {
    status: status.SUCCESS,
    msg: "List client successfully",
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

  const clients: any = await Client.findAll({
    where: { email: payload.email },
    order: [["createdAt", "ASC"]],
  });

  for (let i in clients) {
    resStt.payload.list.push({
      name: clients[i].name,
      id: await encryption.encrypt(clients[i].clientid),
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

  if (req.body.clientid === "" || req.body.clientid === undefined || req.body.clientid === null) {
    return res.json({
      status: status.UNKNOWN,
      msg: "Wrong client id",
    });
  }
  const ClientidDecrypted = await encryption.decrypt(req.body.clientid);

  if (validateid(ClientidDecrypted)) {
    const client: any = await Client.findOne({ where: { clientid: ClientidDecrypted } });

    if (ret.status !== status.SUCCESS) {
      return res.json(ret);
    }

    return res.json({
      status: status.SUCCESS,
      msg: "Load settings successfully",
      settings: JSON.parse(client.settings),
    });
  } else {
    return res.json({
      status: status.UNKNOWN,
      msg: "Wrong client id",
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

  if (req.body.clientid === "" || req.body.clientid === undefined || req.body.clientid === null) {
    return res.json({
      status: status.UNKNOWN,
      msg: "Wrong client id",
    });
  }
  const ClientidDecrypted = await encryption.decrypt(req.body.clientid);

  if (validateid(ClientidDecrypted)) {
    const client: any = await Client.findOne({ where: { clientid: ClientidDecrypted } });

    if (ret.status !== status.SUCCESS) {
      return res.json(ret);
    }

    client.settings = JSON.stringify(req.body.settings);
    await client.save();

    return res.json({
      status: status.SUCCESS,
      msg: "Save settings successfully",
    });
  } else {
    return res.json({
      status: status.UNKNOWN,
      msg: "Wrong client id",
    });
  }
});

router.post("/cleanlog", async function (req, res) {
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

  if (req.body.clientid === "" || req.body.clientid === undefined || req.body.clientid === null) {
    return res.json({
      status: status.UNKNOWN,
      msg: "Wrong client id",
    });
  }
  const ClientidDecrypted = await encryption.decrypt(req.body.clientid);

  if (validateid(ClientidDecrypted)) {
    console.log("client_id", ClientidDecrypted);
    await Log.deleteMany({ client_id: ClientidDecrypted }, function (err) {
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
      msg: "Clear logs successfully",
    });
  } else {
    return res.json({
      status: status.UNKNOWN,
      msg: "Wrong client id",
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

  var ClientidDecrypted;
  try {
    ClientidDecrypted = await encryption.decrypt(req.body.clientid);
  } catch {
    ret = {
      status: status.UNKNOWN,
      msg: "Wrong client id",
    };
    console.log(ret);
    return res.json(ret);
  }

  let client = await Client.findOne({ where: { clientid: ClientidDecrypted } });

  if (ret.status !== status.SUCCESS) {
    console.log(ret);
    return res.json(ret);
  }

  if (client === null) {
    ret = {
      status: status.UNKNOWN,
      msg: "Wrong client id",
    };
    console.log(ret);
    return res.json(ret);
  }

  const wssData = {
    command: "command",
    type: req.body.command,
  };
  wssSendMessage.SendClientByClientId(req.body.clientid, wssData);

  return res.json({
    status: status.SUCCESS,
    msg: "Send command to client successfully",
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

  var ClientidDecrypted;
  try {
    ClientidDecrypted = await encryption.decrypt(req.body.clientid);
  } catch {
    ret = {
      status: status.UNKNOWN,
      msg: "Wrong client id",
    };
    console.log(ret);
    return res.json(ret);
  }

  let client = await Client.findOne({ where: { clientid: ClientidDecrypted } });

  if (ret.status !== status.SUCCESS) {
    console.log(ret);
    return res.json(ret);
  }

  if (client === null) {
    ret = {
      status: status.UNKNOWN,
      msg: "Wrong client id",
    };
    console.log(ret);
    return res.json(ret);
  }

  console.log("string", req.body.string);
  const wssData = {
    command: "commandline",
    string: req.body.string,
  };
  wssSendMessage.SendClientByClientId(req.body.clientid, wssData);

  return res.json({
    status: status.SUCCESS,
    msg: "Send command line to client successfully",
  });
});

export = router;
