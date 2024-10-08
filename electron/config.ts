import fs from "node:fs";

import { configFilePath, defaultDownloadDir } from "./dir";
import { logger } from "./logger";

type Config = {
  apiUrl: string;
  downloadDir: string;
  readMode: number;
};

const defaultConfig: Config = {
  apiUrl: "https://www.jmeadpoolcdn.life",
  downloadDir: defaultDownloadDir,
  readMode: 1,
};

if (!fs.existsSync(configFilePath)) {
  fs.writeFileSync(configFilePath, JSON.stringify(defaultConfig, undefined, 2));
}

export const config = JSON.parse(
  fs.readFileSync(configFilePath, { encoding: "utf-8" }),
) as Config;

logger.info(`读取当前应用配置 ${JSON.stringify(config)}`);

export const updateConfig = (updatedConfig: Partial<Config>) => {
  Object.assign(config, updatedConfig);
  fs.writeFileSync(configFilePath, JSON.stringify(config, undefined, 2));
};
