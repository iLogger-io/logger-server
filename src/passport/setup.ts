import passport from "passport";
import passportLocal from "passport-local";
import passportGoogle from "passport-google-oauth2";
import { User } from "../models/db";
import logger from "../utils/logger";
import * as jwt from "../lib/jwt";
import status from "../constants/status";

const LocalStrategy = passportLocal.Strategy;
const GoogleStrategy = passportGoogle.Strategy;

passport.serializeUser(async function (user: any, done: any) {
  logger.info(`serializeUser ${user.email}`);
  const CurrentUser: any = await User.findOne({ where: { email: user.email } });
  console.log("id", CurrentUser.id);
  done(null, CurrentUser.id);
});

passport.deserializeUser(async function (id: any, done: any) {
  console.log(`deserializeUser ${id}`);
  const CurrentUser: any = await User.findOne({ where: { id: id } });
  done(null, CurrentUser.dataValues);
});

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email: string, password: string, done: any) => {
      const user: any = await User.findOne({ where: { email: email } });
      if (user === null) {
        return done(null, false, { code: status.EMAIL_INVALID, msg: "Incorrect email." });
      } else if (user.emailVerified === false) {
        return done(null, false, {
          message: "Email already exists but has not been verified, please check your mailbox.",
        });
      } else if (!jwt.validPassword(user.salt, password, user.password)) {
        return done(null, false, { code: status.PASS_NOT_MATCHED, msg: "Incorrect password." });
      }
      return done(null, user);
    },
  ),
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.API_PATH}/auth/google/callback`,
      passReqToCallback: true,
    },
    async function (request: any, accessToken: any, refreshToken: any, profile: any, done: any) {
      const user = await User.findOne({ where: { email: profile.email } });
      if (user === null) {
        const newuser: any = new User();
        newuser.displayName = profile.displayName;
        newuser.givenName = profile.given_name;
        newuser.familyName = profile.family_name;
        newuser.email = profile.email;
        newuser.emailVerified = profile.email_verified;
        await newuser.save();
        return done(null, newuser);
      }
      return done(null, user);
    },
  ),
);

export = passport;
