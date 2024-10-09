import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

import { app } from "electron";
import { singleton } from "tsyringe";

@singleton()
export class DirService {
  dataDir: string;

  constructor() {
    // @inject(delay(() => LoggerService)) private loggerService?: LoggerService,
    this.dataDir = join(
      import.meta.env.DEV ? app.getAppPath() : dirname(app.getPath("exe")),
      "data",
    );
  }

  public get(name: "data" | "log" | "db" | "config"): string {
    switch (name) {
      case "data": {
        return this.tryToCreateDir(this.dataDir);
      }
      case "log": {
        return this.tryToCreateDir(join(this.dataDir, "log"));
      }
      case "db": {
        return join(this.dataDir, "app.db");
      }
      case "config": {
        return join(this.dataDir, "config.json");
      }
      default: {
        const errMsg = `无法获取对应文件夹，服务名称 ${name}`;
        throw new Error(errMsg);
      }
    }
  }

  private tryToCreateDir(path: string): string {
    if (!existsSync(path)) {
      try {
        mkdirSync(path, {
          recursive: true,
        });
      } catch (e: any) {
        console.error(e);
      }
    }
    return path;
  }
}
