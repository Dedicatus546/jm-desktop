import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { ipcMain } from "electron";
import { omit } from "radash";
import { inject, singleton } from "tsyringe";

import { LoggerService } from "../logger";
import { PathService } from "../path";

export type Config = {
  mode: "light" | "dark";
  apiUrl: string;
  downloadDir: string;
  readMode: number;
  currentShuntKey: number | undefined;
  autoLogin: boolean;
  loginUserInfo: string;
  zoomFactor: number;
  windowInfo:
    | {
        x: number;
        y: number;
        width: number;
        height: number;
      }
    | undefined;
  proxy:
    | {
        host: string;
        port: number;
        username: string;
        password: string;
      }
    | undefined;
};

@singleton()
export class ConfigService {
  static DEFAULT_CONFIG: Config = {
    mode: "light",
    apiUrl: "https://www.jmapiproxyxxx.vip",
    downloadDir: "",
    readMode: 1,
    currentShuntKey: undefined,
    autoLogin: false,
    loginUserInfo: "",
    zoomFactor: 1,
    windowInfo: undefined,
    proxy: undefined,
  };

  config: Config;
  configPath: string;

  constructor(
    @inject(PathService) pathService: PathService,
    @inject(LoggerService) private loggerService: LoggerService,
  ) {
    const configPath = (this.configPath = join(
      pathService.getDataDirPath(),
      "config.json",
    ));
    this.loggerService.info(`config 文件路径为 ${configPath}`);
    ConfigService.DEFAULT_CONFIG.downloadDir = join(
      pathService.getDataDirPath(),
      "download",
    );
    this.loggerService.info(
      `预设 config 配置为 ${JSON.stringify(ConfigService.DEFAULT_CONFIG)}`,
    );
    if (!existsSync(configPath)) {
      this.loggerService.info(
        `检测到配置文件 ${configPath} 不存在，使用预设配置创建它`,
      );
      writeFileSync(
        configPath,
        JSON.stringify(ConfigService.DEFAULT_CONFIG, undefined, 2),
      );
    }
    this.config = JSON.parse(
      readFileSync(configPath, { encoding: "utf-8" }),
    ) as Config;

    // 检测下载路径，不存在递归创建
    if (!existsSync(this.config.downloadDir)) {
      this.loggerService.info(
        `检测到下载目录 ${this.config.downloadDir} 不存在，创建它`,
      );
      mkdirSync(this.config.downloadDir, {
        recursive: true,
      });
    }

    this.loggerService.info(`当前应用配置 ${JSON.stringify(this.config)}`);

    ipcMain.handle("app/config", async () => {
      return this.getForRenderer();
    });
    ipcMain.handle("app/updateConfig", async (_e, config) => {
      return this.update(config);
    });
  }

  public get() {
    this.sync();
    this.loggerService.info(`读取应用配置 ${JSON.stringify(this.config)}`);
    return Object.assign({}, this.config);
  }

  public getForRenderer() {
    const config = this.get();
    return omit(config, ["windowInfo"]);
  }

  public update(updatedConfig: Partial<Config>) {
    const sourceConfigStr = JSON.stringify(this.config);
    Object.assign(this.config, updatedConfig);
    writeFileSync(this.configPath, JSON.stringify(this.config, undefined, 2));
    this.loggerService.info(
      `更新应用配置，原配置为：${sourceConfigStr} 参数 ${JSON.stringify(updatedConfig)} 更新结果 ${JSON.stringify(this.config)}`,
    );
  }

  public resolveProxyUrl() {
    const { proxy } = this.config;
    if (!proxy) {
      return undefined;
    }
    const { host, port, username, password } = proxy;
    const url = new URL(`http://${host}:${port}`);
    url.username = username;
    url.password = password;
    // 去除末尾斜杠
    return url.toString().slice(0, -1);
  }

  private sync() {
    this.config = JSON.parse(
      readFileSync(this.configPath, { encoding: "utf-8" }),
    ) as Config;
    this.loggerService.info(`同步应用配置 ${JSON.stringify(this.config)}`);
  }
}
