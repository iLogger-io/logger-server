import { createLogger, format, transports } from "winston";
import validator from "is-my-json-valid";

const { splat, combine, timestamp, printf } = format;

const validate = validator({
  required: true,
  type: "object",
  properties: {
    hello: {
      required: true,
      type: "string",
    },
  },
});

const myFormat = printf(({ timestamp, level, message, meta }: any) => {
  if (validate(message)) {
    message = JSON.stringify(message, null, 4);
  }
  return `${timestamp} ${level.toUpperCase()}  ${message} ${meta ? JSON.stringify(meta) : ""}`;
});

const logger = createLogger({
  format: combine(timestamp(), splat(), myFormat),
  defaultMeta: { service: process.env.SERVICE_NAME },
  transports: [
    new transports.Console(),
    new transports.File({ filename: `./logs/${process.env.SERVICE_NAME}.log` }),
  ],
});

export = logger;
