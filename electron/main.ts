import { app, BrowserWindow } from 'electron'
import { info, error } from 'electron-log'
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
import { resolve } from 'node:path'
import { ee } from './events'

initLog()

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    info('开发环境下注册深度链接协议')
    const success = app.setAsDefaultProtocolClient('jm-desktop', process.execPath, [
      resolve(process.argv[1]),
    ])
    if (success) {
      info('注册 jm-desktop 为深度链接协议成功')
    } else {
      error('注册 jm-desktop 为深度链接协议失败')
    }
  }
} else {
  const success = app.setAsDefaultProtocolClient('jm-desktop')
  if (success) {
    info('注册 jm-desktop 为深度链接协议成功')
  } else {
    error('注册 jm-desktop 为深度链接协议失败')
  }
}

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

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  let homeWin: BrowserWindow | undefined = undefined
  app.on('second-instance', (_event, commandLine, _workingDirectory) => {
    info({
      _event,
      commandLine,
      _workingDirectory,
    })
    if (homeWin) {
      if (homeWin.isMinimized()) {
        homeWin.restore()
      }
      homeWin.focus()
    }
    const url = commandLine.find((arg) => arg.startsWith('jm-desktop://'))
    if (url) {
      ee.emit('deepLinkUpdate', url)
    }
  })

  app.whenReady().then(async () => {
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
    homeWin = await createHomeWindow()
  })
}
