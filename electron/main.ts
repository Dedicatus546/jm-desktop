import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { app, BrowserWindow, session } from "electron";
import { debounce } from "radash";
import { createIPCHandler } from "trpc-electron-fork/main";

import { getConfig, saveConfig } from "./module/config";
import { getExpressServerPort } from "./module/express-server";
import { createLogger } from "./module/logger";
import { emitter } from "./shared/mitt";
import { resolveProxyUrl } from "./shared/utils";
import { router } from "./trpc";

const { info } = createLogger("main");

const __dirname = dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;

const createWindow = async () => {
  let config = await getConfig();

  win = new BrowserWindow({
    icon: join(process.env.VITE_PUBLIC!, "electron-vite.svg"),
    webPreferences: {
      preload: join(__dirname, "preload.mjs"),
      contextIsolation: true,
    },
    autoHideMenuBar: true,
    frame: false,
    ...(config.windowInfo ?? {}),
  });

  const setSessionProxy = async () => {
    if (config.proxyInfo) {
      const proxyUrl = resolveProxyUrl(config.proxyInfo);
      await session.defaultSession.setProxy({
        mode: "fixed_servers",
        proxyRules: proxyUrl,
      });
    } else {
      await session.defaultSession.setProxy({
        mode: "direct",
      });
    }
  };

  await setSessionProxy();

  const saveCurrentWindowInfo = debounce({ delay: 1000 }, async () => {
    const windowInfo = win!.getBounds();
    config.windowInfo = windowInfo;
    await saveConfig(config);
  });

  win.on("close", saveCurrentWindowInfo);
  win.on("move", saveCurrentWindowInfo);
  win.on("resize", saveCurrentWindowInfo);

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    const port = await getExpressServerPort();
    win.loadURL(`http://localhost:${port}`);
  }

  createIPCHandler({
    router,
    windows: [win],
    createContext: async () => ({
      win: win!,
    }),
  });

  emitter.on("onProxyInfoChange", async () => {
    info("proxyInfo 变化，重新设置 sessionProxy");
    config = await getConfig();
    await setSessionProxy();
  });
};

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(createWindow);
