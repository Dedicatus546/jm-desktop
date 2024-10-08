import path from "node:path";

import winston from "winston";

import { logDir } from "./dir";

const infoLogPath = path.resolve(logDir, "info.log");
const errLogPath = path.resolve(logDir, "error.log");

export const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({}),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({
      filename: infoLogPath,
      level: "info",
    }),
    new winston.transports.File({
      filename: errLogPath,
      level: "error",
    }),
  ],
});
