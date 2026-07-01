import { join } from 'node:path'
import log from 'electron-log/main'
import { BrowserWindow, BrowserWindowConstructorOptions, screen, session } from 'electron'
import { getConfig } from './config'
// TODO fix
import { /* isWindowInAvailableDisplayList, */ resolveProxyUrl } from '@main/shared/utils'
import { debounce, isEqual } from 'radash'
import { MAIN_DIST, VITE_DEV_SERVER_URL } from '@main/env'
import { getExpressServerPort, updateProxyMiddleware, updateTarget } from './express-server'
import { Config, ProxyInfo, WindowType as string, WindowInfo, WindowType } from '@common/type'
import { getWindowInfo, updateWindowInfo } from './window-info'
import { ee } from '@main/events'

const windowMap = new Map<string, BrowserWindow>()
const windowIdMap = new Map<BrowserWindow, string>()

type WindowOptionMap = Record<
  string,
  {
    path: `${string}.html`
    saveSize: boolean
    savePosition: boolean
    bwConfig?: BrowserWindowConstructorOptions
  }
>

const windowOptionMap: WindowOptionMap = {
  [string.HOME]: {
    path: 'home.html',
    saveSize: true,
    savePosition: true,
    bwConfig: {
      width: 1200,
      height: 800,
      minWidth: 1200,
      minHeight: 800,
    },
  },
  [string.LOGIN]: {
    path: 'login.html',
    saveSize: false,
    savePosition: true,
    bwConfig: {
      // 如果直接设置 resizable: false
      // 会导致宽高不一致
      width: 500,
      height: 690,
      minWidth: 500,
      minHeight: 690,
      maxWidth: 500,
      maxHeight: 690,
      // resizable: false,
    },
  },
  [string.SETTING]: {
    path: 'setting.html',
    saveSize: false,
    savePosition: true,
    bwConfig: {
      width: 500,
      height: 735,
      minWidth: 500,
      minHeight: 735,
      maxWidth: 500,
      maxHeight: 735,
      // resizable: false,
    },
  },
  [string.ABOUT]: {
    path: 'about.html',
    saveSize: false,
    savePosition: true,
    bwConfig: {
      width: 700,
      height: 460,
      minWidth: 700,
      minHeight: 460,
      maxWidth: 700,
      maxHeight: 460,
      // resizable: false,
    },
  },
  [string.SIGN]: {
    path: 'sign.html',
    saveSize: false,
    savePosition: true,
    bwConfig: {
      width: 1200,
      height: 950,
      minWidth: 1200,
      minHeight: 950,
      maxWidth: 1200,
      maxHeight: 950,
      // resizable: false,
    },
  },
  [string.DOWNLOAD]: {
    path: 'download.html',
    saveSize: false,
    savePosition: true,
    bwConfig: {
      width: 1200,
      height: 950,
      minWidth: 1200,
      minHeight: 950,
      maxWidth: 1200,
      maxHeight: 950,
      // resizable: false,
    },
  },
  [string.NOTIFICATION]: {
    path: 'notification.html',
    saveSize: false,
    savePosition: false,
    bwConfig: {
      width: 400,
      height: 200,
      minWidth: 400,
      minHeight: 200,
      maxWidth: 400,
      maxHeight: 200,
      // resizable: false,
      movable: false,
      show: false,
    },
  },
}

export const hasWindow = (id: string) => {
  return windowMap.get(id) !== undefined
}

export const getWindow = (id: string) => {
  return windowMap.get(id)
}

const setZoomFactor = async (win: BrowserWindow, zoomFactor: number) => {
  // 必须先调用 setVisualZoomLevelLimits 解除缩放限制
  await win.webContents.setVisualZoomLevelLimits(1, 3)
  win.webContents.setZoomFactor(zoomFactor)
}

const setSessionProxy = async (proxyInfo: ProxyInfo | null) => {
  if (proxyInfo) {
    const proxyUrl = resolveProxyUrl(proxyInfo)
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

const saveCurrentWindowInfo = async (win: BrowserWindow, id: string) => {
  const bounds = win.getBounds()
  const options = windowOptionMap[id]
  const { savePosition, saveSize } = options
  const o: WindowInfo = {}
  if (savePosition) {
    Object.assign(o, {
      x: bounds.x,
      y: bounds.y,
    })
  }
  if (saveSize) {
    Object.assign(o, {
      width: bounds.width,
      height: bounds.height,
    })
  }
  if (savePosition || saveSize) {
    await updateWindowInfo(id, o)
  }
}

const saveCurrentWindowInfoDebounce = debounce({ delay: 1000 }, saveCurrentWindowInfo)

export const createWindow = async (id: string, type: WindowType, query?: Record<string, any>) => {
  const logger = log.scope(`window[${id}-${type}]`)
  const disposeFnList: Array<() => void> = []

  const options = windowOptionMap[type]
  const { bwConfig, path, savePosition, saveSize } = options
  const config = getConfig()
  const windowInfo = getWindowInfo(id)
  let win: BrowserWindow | undefined = undefined

  const o: WindowInfo = {}
  if (windowInfo) {
    if (savePosition) {
      Object.assign(o, {
        x: windowInfo.x,
        y: windowInfo.y,
      })
    }
    if (saveSize) {
      Object.assign(o, {
        width: windowInfo.width,
        height: windowInfo.height,
      })
    }
  }

  logger.info('preload.mjs 文件路径', join(MAIN_DIST, 'preload.mjs'))
  win = new BrowserWindow(
    Object.assign({}, bwConfig, {
      icon: join(process.env.VITE_PUBLIC!, 'electron-vite.svg'),
      webPreferences: {
        preload: join(MAIN_DIST, 'preload.mjs'),
        contextIsolation: true,
      },
      autoHideMenuBar: true,
      frame: false,
      useContentSize: true, // 让 width/height 直接控制网页内容区域
      ...o,
    }),
  )

  if (type === string.NOTIFICATION) {
    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize
    const [windowWidth, windowHeight] = win.getContentSize()
    const x = screenWidth - windowWidth
    const y = screenHeight - windowHeight
    win.setPosition(x, y)
    win.show()
  }

  windowMap.set(id, win)
  windowIdMap.set(win, id)

  // 第一次启动后要记录 electron 默认设置的位置
  if (!windowInfo) {
    await saveCurrentWindowInfo(win, id)
  }

  win.on('close', () => {
    disposeFnList.forEach((fn) => fn())
    saveCurrentWindowInfo(win, id)
    windowMap.delete(id)
    windowIdMap.delete(win)
  })
  win.on('move', () => saveCurrentWindowInfoDebounce(win, id))
  win.on('resize', () => saveCurrentWindowInfoDebounce(win, id))

  if (VITE_DEV_SERVER_URL) {
    const url = new URL(path, VITE_DEV_SERVER_URL)
    if (query) {
      Object.keys(query).forEach((key) => {
        url.searchParams.append(key, query[key])
      })
    }
    await win.loadURL(url.toString())
    logger.info('加载 DEV 地址', url.toString())
  } else {
    const port = await getExpressServerPort()
    const url = new URL(path, `http://localhost:${port}`)
    if (query) {
      Object.keys(query).forEach((key) => {
        url.searchParams.append(key, query[key])
      })
    }
    await win.loadURL(url.toString())
    logger.info('加载 PROD 地址', url.toString())
  }

  // 放在 loadURL 后，不然白屏
  await setZoomFactor(win, config.zoomFactor)

  const onUpdateConfig = async (config: Config, oldConfig: Config) => {
    if (config.zoomFactor !== oldConfig.zoomFactor) {
      await setZoomFactor(win, config.zoomFactor)
    }
  }
  ee.on('configUpdate', onUpdateConfig)
  disposeFnList.push(() => {
    ee.off('configUpdate', onUpdateConfig)
  })

  return win!
}

export const createHomeWindow = async () => {
  const homeWindow = await createWindow(WindowType.HOME, WindowType.HOME)
  const logger = log.scope(`window[${WindowType.HOME}]`)
  const disposeFnList: Array<() => void> = []
  let config = getConfig()
  setSessionProxy(config.proxyInfo)

  const onUpdateConfig = async (config: Config, oldConfig: Config) => {
    if (!isEqual(config.proxyInfo, oldConfig.proxyInfo)) {
      logger.info('检测到代理设置变更，重新启动 express 服务器')
      updateProxyMiddleware()
      await setSessionProxy(config.proxyInfo)
    }
    if (config.apiUrl !== oldConfig.apiUrl) {
      updateTarget()
    }
  }
  ee.on('configUpdate', onUpdateConfig)
  disposeFnList.push(() => {
    ee.off('configUpdate', onUpdateConfig)
  })
  homeWindow.addListener('close', () => {
    disposeFnList.forEach((fn) => fn())
  })
  return homeWindow
}

export const clearAllWindow = () => {
  windowMap.clear()
  windowIdMap.clear()
}

export const getWindowId = (win: BrowserWindow) => {
  return windowIdMap.get(win)!
}

export const showWindow = async (id: string, type: WindowType, query?: Record<string, any>) => {
  if (hasWindow(id)) {
    const win = getWindow(id)!
    if (win.isMinimized()) {
      win.restore()
    }
    // 聚焦提升到最顶层
    win.focus()
    return
  }
  await createWindow(id, type, query)
}
