import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session";

import logger from "./utils/logger";
import passport from "./passport/setup";
import authApi from "./api/auth";
import loggerApi from "./api/logger";
import clientApi from "./api/client";
import * as wss from "./wss";
import * as mail from "./utils/mail";

const app = express();
app.use(express.static("public"));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.COOKIE_KEY!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());
app.use(process.env.API_PATH + "/auth", authApi);
app.use(process.env.API_PATH + "/logger", loggerApi);
app.use(process.env.API_PATH + "/client", clientApi);

mail.init();

const server = app.listen(process.env.PORT, () =>
  logger.info(`Server listening at http://${process.env.HOST}:${process.env.PORT}`),
);
wss.init(server);
