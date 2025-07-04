import { existsSync, mkdirSync, openSync, writeSync } from "node:fs";
import { EOL } from "node:os";
import { resolve } from "node:path";
import { format as stringFormat } from "node:util";

import { dataDir } from "@electron/shared/path";
import { format } from "date-fns";

const loggerDir = resolve(dataDir, "log");

if (!existsSync(loggerDir)) {
  mkdirSync(loggerDir, {
    recursive: true,
  });
}

const infoLogPath = resolve(loggerDir, "info.log");
const errorLogPath = resolve(loggerDir, "error.log");
const warnLogPath = resolve(loggerDir, "warn.log");
const infoLogFd = openSync(infoLogPath, "a");
const errorLogFd = openSync(errorLogPath, "a");
const warnLogFd = openSync(warnLogPath, "a");

const getDatetime = () => {
  return format(new Date(), "yyyy.MM.dd HH:mm:ss");
};

const logger = {
  info(message?: any, ...optionalParams: any[]) {
    const datetime = getDatetime();
    const messageFormated = stringFormat(
      `[${datetime}] ${message}`,
      ...optionalParams,
    );
    console.info(messageFormated);
    writeSync(infoLogFd, messageFormated);
    writeSync(infoLogFd, EOL);
  },
  error(message?: any, ...optionalParams: any[]) {
    const datetime = getDatetime();
    const messageFormated = stringFormat(
      `[${datetime}] ${message}`,
      ...optionalParams,
    );
    console.error(messageFormated);
    writeSync(errorLogFd, messageFormated);
    writeSync(errorLogFd, EOL);
  },
  warn(message?: any, ...optionalParams: any[]) {
    const datetime = getDatetime();
    const messageFormated = stringFormat(
      `[${datetime}] ${message}`,
      ...optionalParams,
    );
    console.error(messageFormated);
    writeSync(warnLogFd, messageFormated);
    writeSync(warnLogFd, EOL);
  },
};

export type LoggerLevel = keyof typeof logger;

export const createLogger = (...nameList: string[]) => {
  const prefix = nameList.map((item) => `[${item}]`).join(" ");
  return {
    info(message?: any, ...optionalParams: any[]) {
      logger.info(`${prefix} ` + message, ...optionalParams);
    },
    error(message?: any, ...optionalParams: any[]) {
      logger.error(`${prefix} ` + message, ...optionalParams);
    },
    warn(message?: any, ...optionalParams: any[]) {
      logger.warn(`${prefix} ` + message, ...optionalParams);
    },
  };
};
