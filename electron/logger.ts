import fs from "node:fs";
import path from "node:path";

import winston from "winston";

import { appDir } from "./utils";

const logFileDir = path.resolve(appDir, "log");

if (!fs.existsSync(logFileDir)) {
  fs.mkdirSync(logFileDir);
}

const infoLogPath = path.resolve(logFileDir, "info.log");
const errLogPath = path.resolve(logFileDir, "error.log");

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
