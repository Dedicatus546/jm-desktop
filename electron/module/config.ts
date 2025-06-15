import { existsSync, writeFileSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { dataDir } from "@electron/shared/path";

export type Theme = "light" | "dark";
export type ReadMode = "scroll" | "click";
export type WindowInfo = {
  x: number;
  y: number;
  width: number;
  height: number;
};
export type ProxyInfo = {
  host: string;
  port: number;
  username: string;
  password: string;
};
export type Config = {
  theme: Theme;
  apiUrl: string;
  apiUrlList: Array<string>;
  currentShuntKey?: number | undefined;
  downloadDir: string;
  readMode: ReadMode;
  autoLogin: boolean;
  loginUserInfo: string;
  zoomFactor: number;
  windowInfo?: WindowInfo | undefined;
  proxyInfo?: ProxyInfo | undefined;
};

export const configFilepath = resolve(dataDir, "config.json");

export const defaultConfig: Config = {
  theme: "light",
  apiUrl: "https://api.mangacopy.com/api/v3",
  apiUrlList: [
    "https://api.copy2000.online/api/v3",
    "https://api.mangacopy.com/api/v3",
  ],
  downloadDir: "",
  readMode: "scroll",
  autoLogin: true,
  loginUserInfo: "",
  zoomFactor: 1.0,
  currentShuntKey: undefined,
  windowInfo: undefined,
  proxyInfo: undefined,
};

if (!existsSync(configFilepath)) {
  writeFileSync(configFilepath, JSON.stringify(defaultConfig, undefined, 2));
}

export const getConfig = async () => {
  const str = await readFile(configFilepath, { encoding: "utf-8" });
  return JSON.parse(str) as Config;
};

export const saveConfig = async (config: Config) => {
  await writeFile(configFilepath, JSON.stringify(config, undefined, 2));
};
