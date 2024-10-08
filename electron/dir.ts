import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { app } from "electron";

const tryToCreateDir = (path: string) => {
  if (!existsSync(path)) {
    mkdirSync(path, {
      recursive: true,
    });
  }
};

export const appDir = import.meta.env.DEV
  ? app.getAppPath()
  : dirname(app.getPath("exe"));

// 全局数据存放文件
export const dataDir = resolve(appDir, "data");
tryToCreateDir(dataDir);

export const logDir = resolve(dataDir, "log");
tryToCreateDir(logDir);

export const dbFilePath = resolve(dataDir, "app.db");

export const configFilePath = resolve(dataDir, "config.json");

export const defaultDownloadDir = resolve(dataDir, "download");
tryToCreateDir(defaultDownloadDir);
