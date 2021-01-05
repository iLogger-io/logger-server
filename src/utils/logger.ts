import { createLogger, format, transports } from "winston";

const { splat, combine, timestamp, printf } = format;

const myFormat = printf(({ timestamp, level, message, meta }: any) => {
  return `${timestamp} ${level.toUpperCase()}  ${JSON.stringify(message, null, 4)} ${
    meta ? JSON.stringify(meta) : ""
  }`;
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
