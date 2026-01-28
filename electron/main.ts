import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { app, BrowserWindow, Display, screen, session } from 'electron'
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

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

const createWindow = async () => {
  let config = await getConfig()
  if (config.windowInfo && !isWindowInAvailableDisplayList(config.windowInfo)) {
    info('存在已记录的窗口位置且不在当前的显示器列表中，使用默认的窗口位置')
    config.windowInfo = undefined
    await saveConfig(config)
  }

  win = new BrowserWindow({
    icon: join(process.env.VITE_PUBLIC!, 'electron-vite.svg'),
    webPreferences: {
      preload: join(__dirname, 'preload.mjs'),
      contextIsolation: true,
    },
    autoHideMenuBar: true,
    frame: false,
    ...(config.windowInfo ?? {
      width: 1200,
      height: 600,
    }),
    minWidth: 1200,
    minHeight: 600,
  })

  // 第一次启动后要记录 electron 默认设置的位置
  if (!config.windowInfo) {
    config.windowInfo = win.getBounds()
    await saveConfig(config)
  }

  const setSessionProxy = async () => {
    if (config.proxyInfo) {
      const proxyUrl = resolveProxyUrl(config.proxyInfo)
      await session.defaultSession.setProxy({
        mode: 'fixed_servers',
        proxyRules: proxyUrl,
      })
    } else {
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
  } else {
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

  // 显示器删除
  screen.addListener('display-removed', (_e, display) => {
    info('检测到移除了显示器 id %s', display.id)
  })
  // 分辨率调整（用户更改显示设置）
  // 缩放比例变化（DPI/缩放设置更改）
  // 屏幕旋转（横屏/竖屏切换）
  // 任务栏位置/大小变化（影响工作区域）
  // 多显示器配置中单个显示器的设置变化
  screen.addListener('display-metrics-changed', (_e, display /* metrics */) => {
    info('检测到显示器设置发生变化 id %s', display.id)
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

// 如果窗口位置在某个已存在的 screen 内占据大于 50% 时，则此时认为窗口并未被严重遮挡
const isWindowInAvailableDisplayList = (windowInfo: WindowInfo) => {
  const displayList = screen.getAllDisplays()
  return displayList.some((display) => {
    const overlapArea = getIntersectionAreaBetweenWindowAndDisplay(windowInfo, display)
    const area = windowInfo.width * windowInfo.height
    return overlapArea / area > 0.5
  })
}

// 获取窗口和屏幕的交集区域面积
const getIntersectionAreaBetweenWindowAndDisplay = (windowInfo: WindowInfo, display: Display) => {
  const { x, y, width, height } = display.bounds
  const { x: windowX, y: windowY, width: windowWidth, height: windowHeight } = windowInfo
  const left = Math.max(x, windowX)
  const right = Math.min(x + width, windowX + windowWidth)
  const top = Math.max(y, windowY)
  const bottom = Math.min(y + height, windowY + windowHeight)

  const overlapWidth = right - left
  const overlapHeight = bottom - top

  const overlapArea = Math.max(0, overlapWidth) * Math.max(0, overlapHeight)
  return overlapArea
}
