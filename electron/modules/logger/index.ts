import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

import { ipcMain } from "electron";
import { inject, singleton } from "tsyringe";
import winston, { format, Logger } from "winston";

import { PathService } from "../path";

@singleton()
export class LoggerService {
  private logger: Logger;
  private loggerDir: string;
  private loggerInfoFilePath;
  private loggerErrorFilePath;
  private logCallbackList: Array<() => void>;

  constructor(@inject(PathService) pathService: PathService) {
    this.logCallbackList = [];
    this.loggerDir = join(pathService.getDataDirPath(), "log");
    if (existsSync(this.loggerDir)) {
      this.delayLog(() => {
        this.info(`检测到日志目录 ${this.loggerDir} 不存在，创建它`);
      });
      mkdirSync(this.loggerDir, {
        recursive: true,
      });
    }
    this.loggerInfoFilePath = join(this.loggerDir, "info.log");
    this.delayLog(() => {
      this.info(`info 日志路径为 ${this.loggerInfoFilePath}`);
    });
    this.loggerErrorFilePath = join(this.loggerDir, "error.log");
    this.delayLog(() => {
      this.info(`error 日志路径为 ${this.loggerErrorFilePath}`);
    });
    this.logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp({}),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.File({
          filename: this.loggerInfoFilePath,
          level: "info",
          format: format((info) => {
            // 只记录 info 级别的日志
            return info.level === "info" ? info : false;
          })(),
        }),
        new winston.transports.File({
          filename: this.loggerErrorFilePath,
          level: "error",
        }),
      ],
    });
    this.delayLog(() => {
      this.info(`创建日志对象成功`);
    });
    this.logCallbackList.forEach((fn) => fn());

    ipcMain
      .on("logger/info", (_e, msg: string) => {
        this.ipcRendererInfo(msg);
      })
      .on("logger/error", (_e, err: string) => {
        this.ipcRendererError(err);
      });
  }

  public info(msg: string) {
    this.logger.info(`[ipcMain] ${msg}`);
  }

  public error(err: string) {
    this.logger.error(`[ipcMain] ${err}`);
  }

  private ipcRendererInfo(msg: string) {
    this.logger.info(`[ipcRenderer] ${msg}`);
  }

  private ipcRendererError(err: string) {
    this.logger.error(`[ipcRenderer] ${err}`);
  }

  private delayLog(fn: () => void) {
    this.logCallbackList.push(fn);
  }
}
