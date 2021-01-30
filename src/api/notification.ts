import express from "express";
import status from "../constants/status";
import * as jwt from "../lib/encryption";

const router = express.Router();

router.post("/getnotifications", async function (req, res) {
  const Url = req.protocol + "://" + req.get("host") + req.originalUrl;
  console.log("Url", Url);

  const payload = jwt.verifyToken(process.env.JWT_SECRET!, req);
  if (payload === null) {
    return res.json({
      status: status.ERROR,
      msg: "Token decode error",
      code: status.TOKEN_DECODE_ERROR,
    });
  }

  return res.json({
    status: status.SUCCESS,
    msg: "OK",
  });
});

export = router;
