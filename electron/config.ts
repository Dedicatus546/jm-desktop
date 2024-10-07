import fs from "node:fs";
import path from "node:path";

import { logger } from "./logger";
import { appDir } from "./utils";

const configDir = path.resolve(appDir, "config");
const configPath = path.resolve(configDir, "config.json");
const defaultDownloadDir = path.resolve(appDir, "download");

type Config = {
  apiUrl: string;
  downloadDir: string;
};

const defaultConfig: Config = {
  apiUrl: "https://www.jmeadpoolcdn.life",
  downloadDir: defaultDownloadDir,
};

if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir);
}

if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, JSON.stringify(defaultConfig, undefined, 2));
}

export const config = JSON.parse(
  fs.readFileSync(configPath, { encoding: "utf-8" }),
) as Config;

logger.info(`读取当前应用配置 ${JSON.stringify(config)}`);

export const updateConfig = (updatedConfig: Partial<Config>) => {
  Object.assign(config, updatedConfig);
  fs.writeFileSync(configPath, JSON.stringify(config, undefined, 2));
};
