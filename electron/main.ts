import { app, BrowserWindow } from 'electron'
import { clearAllWindow, createHomeWindow, getWindowId } from './module/window-manager'
import { createIPCHandler } from 'trpc-electron-fork/main'
import { router } from './trpc'
import { initConfigFile } from './module/config'
import { initDataDir } from './shared/path'
import { initWindowInfoMapFile } from './module/window-info'
import { startExpressServer } from './module/express-server'
import { initLog } from './module/logger'
import { isDev } from './env'
import { initDownloadFile } from './module/download'

initLog()

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    clearAllWindow()
  }
})

app.on('activate', async () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    // const mainWindow = await createMainWindow()
  }
})

app.whenReady().then(async () => {
  app.setAsDefaultProtocolClient('jm-desktop')
  if (isDev) {
    const { devtron } = await import('@electron/devtron')
    await devtron.install()
  }
  await initDataDir()
  await initConfigFile()
  await initDownloadFile()
  await initWindowInfoMapFile()
  await startExpressServer()
  createIPCHandler({
    router,
    windows: [],
    createContext: async ({ event }) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      const winId = getWindowId(win!)
      return {
        win: win!,
        winId,
      }
    },
  })
  await createHomeWindow()
})
