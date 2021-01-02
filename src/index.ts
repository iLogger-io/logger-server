const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("./passport/setup");
const authRoute = require("./routes/auth");
const loggerRoute = require("./routes/logger");
const deviceRoute = require("./routes/device");
const wss = require("../wss");
const mail = require("./lib/mail");
const config = require("../config/user.json");

const app = express();
const API_PATH = "/api/v1";

app.use(express.static("public"));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(API_PATH + "/auth", authRoute);
app.use(API_PATH + "/logger", loggerRoute);
app.use(API_PATH + "/device", deviceRoute);

mail.init();
const server = app.listen(config.PORT, () =>
  console.log(`Server listening at http://localhost:${config.PORT}`),
);
wss.init(server);

mongoose.connect("mongodb://localhost:27017/logger", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
