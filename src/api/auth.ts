import express from "express";
import passport from "passport";
import { User } from "../models/db";
import status from "../constants/status";
import { genid } from "../utils/helper";
import * as mail from "../utils/mail";
import * as encryption from "../lib/encryption";
import logger from "../utils/logger";

const router = express.Router();

router.post("/verifyemail", async function (req: any, res: any) {
  const user: any = await User.findOne({
    where: { emailVerifiedId: req.body.VerifyEmailId },
  });

  if (user === null) {
    return res.json({
      status: status.UNKNOWN,
      msg: "Email verification id has expired",
    });
  }

  if (user.emailVerified === true) {
    return res.json({
      status: status.SUCCESS,
      msg: "Email has been verified",
    });
  }

  user.emailVerified = true;
  await user.save();

  return res.json({
    status: status.SUCCESS,
    msg: "Email verification done",
  });
});

router.post("/signup", async function (req: any, res: any) {
  if (req.body.password !== req.body.passwordConfirm) {
    return res.json({
      status: status.PASS_NOT_MATCHED,
      msg: "Password confirm do not match",
    });
  }

  const checkuser: any = await User.findOne({ where: { email: req.body.email } });
  if (checkuser !== null) {
    if (checkuser.emailVerified) {
      return res.json({
        status: status.EMAIL_ALREADY_EXISTS,
        msg: "Email already exists and register successfully",
      });
    } else {
      await checkuser.destroy();
    }
  }

  const emailVerifiedId = genid().replace(/-/g, "");

  const user: any = new User();
  user.displayName = req.body.displayName;
  user.givenName = "";
  user.familyName = "";
  user.email = req.body.email;
  user.password = req.body.password;
  user.emailVerifiedId = emailVerifiedId;
  await user.save();

  const content = `
  <h2 style="color: #2e6c80;">Click on this link to verify your email:</h2>
  <p><strong>&nbsp;<a href="${process.env.BASE_URL}/verifyemail?id=${emailVerifiedId}">${process.env.BASE_URL}/verifyemail?id=${emailVerifiedId}</a></strong></p>
  `;
  mail.send(req.body.email, "iLogger Email Verification", content);

  if (checkuser !== null && checkuser.emailVerified === false) {
    return res.json({
      status: status.UNKNOWN,
      msg: "Email already exists but has not been verified, please check your mailbox",
    });
  }

  return res.json({
    status: status.SUCCESS,
    msg: "Signup successfully, please check your mailbox to verify your email",
  });
});

router.post("/login", function (req, res, next) {
  passport.authenticate("local", { session: false }, function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (user.emailVerified === false) {
      return res.json({
        status: status.ERROR,
        code: status.EMAIL_NOT_VERIFIED,
        msg: "Email already exists but has not been verified, please check your mailbox",
      });
    } else if (user) {
      const payload = {
        id: user.id,
        email: user.email,
      };
      const access_token = encryption.jwtEncode(payload, process.env.JWT_SECRET!, 60 * 60 * 24 * 7);
      const refresh_token = encryption.jwtEncode(
        payload,
        process.env.JWT_SECRET!,
        60 * 60 * 24 * 30,
      );
      return res.json({
        status: status.SUCCESS,
        msg: "Login successfully",
        payload: {
          access_token: access_token,
          refresh_token: refresh_token,
        },
      });
    } else if (user === null) {
      return res.json({
        status: status.ERROR,
        code: status.LOGIN_FAILED,
        msg: info.message,
      });
    }
  })(req, res, next);
});

router.get("/user", async function (req: any, res: any) {
  return res.json({
    status: status.SUCCESS,
    msg: "user",
    user: req.user,
  });
});

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: `${process.env.API_PATH}/auth/google/success`,
    failureRedirect: `${process.env.API_PATH}/auth/google/failure`,
  }),
);

router.get("/google/success", async function (req: any, res: any) {
  return res.json({
    status: 0,
    msg: "Google login successfully",
  });
});

router.get("/google/failure", async function (req: any, res: any) {
  return res.json({
    status: status.ERROR,
    code: status.GG_OAUTH_FAILED,
    msg: "Google login error",
  });
});

export = router;
