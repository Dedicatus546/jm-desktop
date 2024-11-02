import { join } from "node:path";

import { app, BrowserWindow, dialog, ipcMain, screen, shell } from "electron";
import { inject, singleton } from "tsyringe";

import { ConfigService } from "../config";
import { DbService } from "../db";
import { LoggerService } from "../logger";
import { PathService } from "../path";
import { ProxyServerService } from "../proxy-server";

@singleton()
export class WinService {
  private win: BrowserWindow | null = null;

  constructor(
    @inject(ProxyServerService) private proxyServerService: ProxyServerService,
    @inject(PathService) private pathService: PathService,
    @inject(LoggerService) private loggerService: LoggerService,
    // @ts-expect-error inject dbService
    @inject(DbService) private dbService: DbService,
    @inject(ConfigService) private configService: ConfigService,
  ) {
    app.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        this.quit();
      }
    });

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createWin();
      }
    });

    app.whenReady().then(() => {
      this.createWin();

      ipcMain
        .on("app/minimizeWin", () => {
          this.win?.minimize();
        })
        .on("app/closeWin", () => {
          this.win?.close();
        })
        .on("app/openLink", (_v, link: string) => {
          shell.openExternal(link);
        })
        .on("app/openFile", (_v, path: string) => {
          shell.openPath(path);
        });
      ipcMain.handle("app/selectFolder", async () => {
        const result = await dialog.showOpenDialog(this.win!, {
          properties: ["openDirectory"],
        });
        return result.filePaths[0];
      });
    });
  }

  private async createWin() {
    const { minWidth, minHeight, x, y, width, height, zoomFactor } =
      this.resolveWindowInfo();

    this.loggerService.info(`最小窗口大小 ${minWidth}x${minHeight}`);
    this.loggerService.info(`窗口位置 ${x} ${y} | ${width}x${height}`);
    this.loggerService.info(`zoomFactor值 ${zoomFactor}`);

    const win = (this.win = new BrowserWindow({
      icon: join(this.pathService.getPublicPath(), "png", "256x256.png"),
      webPreferences: {
        preload: join(this.pathService.getDistElectronPath(), "preload.mjs"),
      },
      x,
      y,
      width,
      height,
      autoHideMenuBar: true,
      frame: false,
      minWidth: minWidth,
      minHeight: minHeight,
    }));

    // 必须先调用 setVisualZoomLevelLimits 解除缩放限制
    win.webContents.setVisualZoomLevelLimits(1, 3).then(() => {
      win.webContents.setZoomFactor(zoomFactor);
    });

    // 退出时保存窗口位置信息
    win.on("close", () => {
      this.saveWindowInfo();
    });

    process.on("uncaughtException", () => {
      this.quit();
    });

    const devServerUrl = process.env["VITE_DEV_SERVER_URL"];
    if (devServerUrl) {
      await win.loadURL(devServerUrl);
      win?.webContents.openDevTools();
      this.loggerService.info(`加载开发服务器地址 ${devServerUrl}`);
    } else {
      const port = await this.proxyServerService.getPort();
      await win.loadURL(`http://localhost:${port}`);
      this.loggerService.info(`加载打包后服务器地址 http://localhost:${port}`);
    }
  }

  // 选择保存的窗口位置（优先，如果存在）和默认位置
  private resolveWindowInfo() {
    const display = screen.getPrimaryDisplay();
    const { width, height } = display.size;
    this.loggerService.info(`主显示器大小 ${width}x${height}`);

    const minWidth = Math.round(width * 0.5);
    const minHeight = Math.round(height * 0.5);

    const initWidth = Math.round(width * 0.7);
    const initHeight = Math.round(height * 0.8);

    const r: {
      minWidth: number;
      minHeight: number;
      x: undefined | number;
      y: undefined | number;
      width: number;
      height: number;
      zoomFactor: number;
    } = {
      minWidth,
      minHeight,
      x: undefined,
      y: undefined,
      width: initWidth,
      height: initHeight,
      zoomFactor: 1,
    };

    if (width <= 2560) {
      r.zoomFactor = 1.4;
    } else if (width <= 3840) {
      r.zoomFactor = 1.8;
    }

    if (this.configService.config.windowInfo) {
      this.loggerService.info(`存在上次保存的窗口位置信息`);
      return Object.assign(r, this.configService.config.windowInfo);
    }

    return Object.assign(r, {
      width: initWidth,
      height: initHeight,
    });
  }

  // 获取当前窗口的位置
  private getWindowInfo() {
    if (!this.win) {
      this.loggerService.error("获取应用位置大小失败，应用窗口实例未找到");
      return {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      };
    }
    const rect = this.win.getBounds();
    return {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    };
  }

  // 保存当前窗口的位置
  private saveWindowInfo() {
    const windowInfo = this.getWindowInfo();
    this.configService.update({
      windowInfo,
    });
  }

  private quit() {
    this.win = null;
    this.proxyServerService.closeServer();
    app.quit();
  }
}
