import { User } from "../lib/db";
import passport from "passport";
import passportLocal from "passport-local";

const LocalStrategy = passportLocal.Strategy;

passport.serializeUser((user: any, done: any) => {
  done(null, user.id);
});

passport.deserializeUser((id: any, done: any) => {
  // User.findById(id, (err: any, user: any) => {
  //   done(err, user);
  // });
});

passport.use(
  new LocalStrategy({ usernameField: "email" }, async (email: any, password: any, done: any) => {
    // const user = await User.findOne({ where: { email: email } });
    // // if (err) { return done(err) }
    // if (user === null) {
    //   return done(null, false, { message: "Incorrect email." });
    // }
    // if (!jwttoken.validPassword(user, password)) {
    //   return done(null, false, { message: "Incorrect password." });
    // }
    // return done(null, user);
  }),
);

export = passport;
