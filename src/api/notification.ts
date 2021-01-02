import express from "express";
import status from "../lib/status";
import * as jwttoken from "../lib/token";

const router = express.Router();

router.post("/getnotifications", async function (req, res) {
  const Url = req.protocol + "://" + req.get("host") + req.originalUrl;
  console.log("Url", Url);

  const token = jwttoken.verifyToken(req);
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
