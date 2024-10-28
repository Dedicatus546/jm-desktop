import { join } from "node:path";

import { app, BrowserWindow, dialog, ipcMain, screen, shell } from "electron";
import { inject, singleton } from "tsyringe";

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
  ) {
    // Quit when all windows are closed, except on macOS. There, it's common
    // for applications and their menu bar to stay active until the user quits
    // explicitly with Cmd + Q.
    app.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        app.quit();
        this.win = null;
        this.proxyServerService.closeServer();
      }
    });

    app.on("activate", () => {
      // On OS X it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
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
    const display = screen.getPrimaryDisplay();
    const { width, height } = display.size;
    this.loggerService.info(`主显示器宽高 ${width}x${height}`);

    const initWidth = width * 0.7;
    const initHeight = height * 0.8;
    this.loggerService.info(`初始宽高 ${initWidth}x${initHeight}`);

    const minWidth = width * 0.5;
    const minHeight = height * 0.5;
    const win = (this.win = new BrowserWindow({
      icon: join(this.pathService.getPublicPath(), "png", "256x256.png"),
      webPreferences: {
        preload: join(this.pathService.getDistElectronPath(), "preload.mjs"),
      },
      width: initWidth,
      height: initHeight,
      autoHideMenuBar: true, // 隐藏菜单栏
      frame: false, // 去除边框
      minWidth: minWidth,
      minHeight: minHeight,
    }));

    let zoomLevel: number = 1;
    if (width <= 2560) {
      zoomLevel = 1.4;
    } else if (width <= 3840) {
      zoomLevel = 1.8;
    }
    this.loggerService.info(`zoomLevel 值 ${zoomLevel}`);

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
}
