import { join } from "node:path";

import { ipcMain } from "electron";
import { inject, singleton } from "tsyringe";
import winston, { format, Logger } from "winston";

import { DirService } from "../dir";

@singleton()
export class LoggerService {
  private logger: Logger;

  constructor(@inject(DirService) dirService: DirService) {
    this.logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp({}),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.File({
          filename: join(dirService.get("log"), "info.log"),
          level: "info",
          format: format((info) => {
            // 只记录 info 级别的日志
            return info.level === "info" ? info : false;
          })(),
        }),
        new winston.transports.File({
          filename: join(dirService.get("log"), "error.log"),
          level: "error",
        }),
      ],
    });

    ipcMain
      .on("logger/info", (_e, msg: string) => {
        this.info(msg);
      })
      .on("logger/error", (_e, err: string) => {
        this.error(err);
      });
  }

  public info(msg: string) {
    this.logger.info(msg);
  }

  public error(err: string) {
    this.logger.error(err);
  }
}
