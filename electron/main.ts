import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// import { createRequire } from 'node:module'
import { app, BrowserWindow, dialog, ipcMain } from "electron";

import { config, updateConfig } from "./config";
import { getDownloadList, insertDownload, isDownload } from "./db";
import { logger } from "./logger";
import { closeServer, createServer } from "./server";

// const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;

const createWindow = async () => {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },
    width: 1400,
    height: 900,
    autoHideMenuBar: true, // 隐藏菜单栏
    frame: false, // 去除边框
    minWidth: 750,
    minHeight: 400,
  });

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    await win.loadURL(VITE_DEV_SERVER_URL);
    win?.webContents.openDevTools();
  } else {
    const { port } = await createServer({
      target: config.apiUrl,
    });
    await win.loadURL(`http://localhost:${port}`);
  }
};

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
    closeServer();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app
  .whenReady()
  .then(async () => {
    await createWindow();
  })
  .then(() => {
    ipcMain
      .on("minimizeWin", () => {
        win?.minimize();
      })
      .on("closeWin", () => {
        win?.close();
      })
      .on("logger/info", (_e, msg: string) => {
        logger.info(msg);
      })
      .on("logger/error", (_e, err: string) => {
        logger.error(err);
      });
    ipcMain.handle("app/config", async () => {
      return config;
    });
    ipcMain.handle("app/updateConfig", async (_e, config) => {
      return updateConfig(config);
    });
    ipcMain.handle("app/selectFolder", async () => {
      const result = await dialog.showOpenDialog(win!, {
        properties: ["openDirectory"],
      });
      return result.filePaths[0];
    });
    ipcMain.handle("app/isDownload", async (_e, comicId: number) => {
      return isDownload(comicId);
    });
    ipcMain.handle("app/getDownloadList", async (_e, page, pageSize) => {
      return getDownloadList(page, pageSize);
    });
    ipcMain.handle(
      "app/saveDownloadFile",
      async (_e, buffer: ArrayBuffer, name: string) => {
        writeFileSync(
          path.resolve(config.downloadDir, name),
          Buffer.from(buffer),
        );
      },
    );
    ipcMain.handle("app/insertDownload", async (_e, args) => {
      console.log("app/insertDownload");
      return insertDownload(args);
    });
  });
