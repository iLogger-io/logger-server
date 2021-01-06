import express from "express";
import status from "../constants/status";
import * as jwt from "../lib/jwt";

const router = express.Router();

router.post("/getnotifications", async function (req, res) {
  const Url = req.protocol + "://" + req.get("host") + req.originalUrl;
  console.log("Url", Url);

  const token = jwt.verifyToken(req);
  if (token === null) {
    return res.json({
      status: status.UNKNOWN,
      msg: "Token has expired",
    });
  }

  return res.json({
    status: status.SUCCESS,
    msg: "OK",
  });
});

export = router;
