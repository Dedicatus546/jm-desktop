import { app, BrowserWindow } from 'electron'
import { clearAllWindow, createMainWindow, getWindowId } from './module/window-manager'
import { createIPCHandler } from 'trpc-electron-fork/main'
import { router } from './trpc'
import { initConfigFile } from './module/config'

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
  await initConfigFile()
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
  await createMainWindow()
})
