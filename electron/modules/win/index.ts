import { join } from "node:path";

import { app, BrowserWindow, dialog, ipcMain } from "electron";
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
    @inject(DbService) private dbService: DbService,
  ) {
    app.whenReady().then(() => {
      this.createWin();

      ipcMain
        .on("app/minimizeWin", () => {
          this.win?.minimize();
        })
        .on("app/closeWin", () => {
          this.win?.close();
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
    const win = (this.win = new BrowserWindow({
      icon: join(this.pathService.getPublicPath(), "app-icon.ico"),
      webPreferences: {
        preload: join(this.pathService.getDistElectronPath(), "preload.mjs"),
      },
      width: 1400,
      height: 900,
      autoHideMenuBar: true, // 隐藏菜单栏
      frame: false, // 去除边框
      minWidth: 750,
      minHeight: 400,
    }));

    // Test active push message to Renderer-process.
    // win.webContents.on("did-finish-load", () => {
    //   win?.webContents.send(
    //     "main-process-message",
    //     new Date().toLocaleString(),
    //   );
    // });

    if (this.pathService.getDevServerUrl()) {
      await win.loadURL(this.pathService.getDevServerUrl());
      win?.webContents.openDevTools();
      this.loggerService.info("加载开发服务器地址");
    } else {
      const port = this.proxyServerService.getPort();
      await win.loadURL(`http://localhost:${port}`);
      this.loggerService.info("加载打包后服务器地址");
    }
  }
}
