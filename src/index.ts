import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import passport from "./passport/setup";

import authApi from "./api/auth";
import loggerApi from "./api/logger";
import deviceApi from "./api/device";
import * as wss from "./wss";
import * as mail from "./lib/mail";

const app = express();

app.use(express.static("public"));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(process.env.API_PATH + "/auth", authApi);
app.use(process.env.API_PATH + "/logger", loggerApi);
app.use(process.env.API_PATH + "/device", deviceApi);

mail.init();
const server = app.listen(process.env.PORT, () =>
  console.log(`Server listening at http://${process.env.HOST}:${process.env.PORT}`),
);
wss.init(server);

mongoose.connect(
  `mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_NAME}`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
);
