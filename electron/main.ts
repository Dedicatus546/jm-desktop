import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { app, BrowserWindow, screen, session } from 'electron'
import { debounce } from 'radash'
import { createIPCHandler } from 'trpc-electron-fork/main'

import { getConfig, saveConfig, WindowInfo } from './module/config'
import { getExpressServerPort } from './module/express-server'
import { createLogger } from './module/logger'
import { emitter } from './shared/mitt'
import { resolveProxyUrl } from './shared/utils'
import { router } from './trpc'

const { info } = createLogger('main')

const __dirname = dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

let win: BrowserWindow | null

const createWindow = async () => {
  let config = await getConfig()
  let { windowInfo } = config
  if (windowInfo && !isWindowInfoInDisplayList(windowInfo)) {
    info('存在已记录的窗口位置且不在当前的显示器列表中，使用默认的窗口位置')
    windowInfo = undefined
  }
  const { minWidth, minHeight } = getMinWidthAndMinHeight()
  info('基于主显示器使用的最小宽度和最小高度 %d %d', minWidth, minHeight)

  win = new BrowserWindow({
    icon: join(process.env.VITE_PUBLIC!, 'electron-vite.svg'),
    webPreferences: {
      preload: join(__dirname, 'preload.mjs'),
      contextIsolation: true,
    },
    autoHideMenuBar: true,
    frame: false,
    ...(windowInfo ?? {}),
    minWidth,
    minHeight,
  })

  const setSessionProxy = async () => {
    if (config.proxyInfo) {
      const proxyUrl = resolveProxyUrl(config.proxyInfo)
      await session.defaultSession.setProxy({
        mode: 'fixed_servers',
        proxyRules: proxyUrl,
      })
    }
    else {
      await session.defaultSession.setProxy({
        mode: 'direct',
      })
    }
  }

  await setSessionProxy()

  const setZoomFactor = async () => {
    // 必须先调用 setVisualZoomLevelLimits 解除缩放限制
    await win!.webContents.setVisualZoomLevelLimits(1, 3)
    win!.webContents.setZoomFactor(config.zoomFactor)
  }

  const saveCurrentWindowInfo = debounce({ delay: 1000 }, async () => {
    const windowInfo = win!.getBounds()
    config.windowInfo = windowInfo
    await saveConfig(config)
  })

  win.on('close', saveCurrentWindowInfo)
  win.on('move', saveCurrentWindowInfo)
  win.on('resize', saveCurrentWindowInfo)

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  }
  else {
    const port = await getExpressServerPort()
    win.loadURL(`http://localhost:${port}`)
  }

  // 放在 loadURL 后，不然白屏
  await setZoomFactor()

  createIPCHandler({
    router,
    windows: [win],
    createContext: async () => ({
      win: win!,
    }),
  })

  emitter.on('configChange', async ([newConifg]) => {
    info('检测到配置文件变化')
    config = newConifg
    await setSessionProxy()
    await setZoomFactor()
  })
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)

// 如果窗口位置在某个已存在的 screen 内占据大于 30% 时，则合法
// 否则我们需要将窗口复位
const isWindowInfoInDisplayList = (windowInfo: WindowInfo) => {
  const displayList = screen.getAllDisplays()
  return displayList.some((display) => {
    const { x, y, width, height } = display.bounds
    const { x: windowX, y: windowY, width: windowWidth, height: windowHeight } = windowInfo
    const left = Math.max(x, windowX)
    const right = Math.min(x + width, windowX + windowWidth)
    const top = Math.max(y, windowY)
    const bottom = Math.min(y + height, windowY + windowHeight)

    const overlapWidth = right - left
    const overlapHeight = bottom - top

    const overlapArea = Math.max(0, overlapWidth) * Math.max(0, overlapHeight)
    const area = windowWidth * windowHeight
    return overlapArea / area > 0.3
  })
}

const getMinWidthAndMinHeight = () => {
  const display = screen.getPrimaryDisplay()
  const { width, height } = display.bounds
  // 这里要 Math.round 需要使用整数
  return {
    minWidth: Math.round(width * 0.7),
    minHeight: Math.round(height * 0.85),
  }
}
