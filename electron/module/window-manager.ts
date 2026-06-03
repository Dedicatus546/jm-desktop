import { join } from 'node:path'
import { BrowserWindow, BrowserWindowConstructorOptions, session } from 'electron'
import { getConfig } from './config'
// TODO fix
import { /* isWindowInAvailableDisplayList, */ resolveProxyUrl } from '@electron/shared/utils'
import { createLogger } from './logger'
import { debounce } from 'radash'
import { MAIN_DIST, VITE_DEV_SERVER_URL } from '@electron/env'
import { getExpressServerPort } from './express-server'
import { ProxyInfo, WindowId, WindowInfo } from '@type/index'
import { getWindowInfo, updateWindowInfo } from './window-info'

const windowMap = new Map<WindowId, BrowserWindow>()
const windowIdMap = new Map<BrowserWindow, WindowId>()

type WindowOptionMap = Record<
  WindowId,
  {
    path: 'home.html' | 'login.html' | 'setting.html'
    saveSize: boolean
    savePosition: boolean
    bwConfig?: BrowserWindowConstructorOptions
  }
>

const windowOptionMap: WindowOptionMap = {
  [WindowId.HOME]: {
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
  [WindowId.LOGIN]: {
    path: 'login.html',
    saveSize: false,
    savePosition: true,
    bwConfig: {
      width: 500,
      height: 650,
      resizable: false,
    },
  },
  [WindowId.SETTING]: {
    path: 'setting.html',
    saveSize: false,
    savePosition: true,
    bwConfig: {
      width: 500,
      height: 735,
      resizable: false,
    },
  },
}

export const hasWindow = (id: WindowId) => {
  return windowMap.get(id) !== undefined
}

export const getWindow = (id: WindowId) => {
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

const saveCurrentWindowInfo = async (win: BrowserWindow, id: WindowId) => {
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
  await updateWindowInfo(id, o)
}

const saveCurrentWindowInfoDebounce = debounce({ delay: 1000 }, saveCurrentWindowInfo)

export const createWindow = async (id: WindowId) => {
  const { info } = createLogger(`window[${id}]`)

  const options = windowOptionMap[id]
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

  info('preload.mjs 文件路径', join(MAIN_DIST, 'preload.mjs'))
  win = new BrowserWindow(
    Object.assign({}, bwConfig, {
      icon: join(process.env.VITE_PUBLIC!, 'electron-vite.svg'),
      webPreferences: {
        preload: join(MAIN_DIST, 'preload.mjs'),
        contextIsolation: true,
      },
      autoHideMenuBar: true,
      frame: false,
      ...o,
    }),
  )

  windowMap.set(id, win)
  windowIdMap.set(win, id)

  // 第一次启动后要记录 electron 默认设置的位置
  if (!windowInfo) {
    await saveCurrentWindowInfo(win, id)
  }

  win.on('close', () => {
    saveCurrentWindowInfo(win, id)
    windowMap.delete(id)
    windowIdMap.delete(win)
  })
  win.on('move', () => saveCurrentWindowInfoDebounce(win, id))
  win.on('resize', () => saveCurrentWindowInfoDebounce(win, id))

  if (VITE_DEV_SERVER_URL) {
    const resolvedUrl = (() => {
      const url = new URL(path, VITE_DEV_SERVER_URL)
      return url.toString()
    })()
    await win.loadURL(resolvedUrl)
    info('加载 DEV 地址', resolvedUrl)
  } else {
    const port = await getExpressServerPort()
    await win.loadURL(`http://localhost:${port}${path}`)
    info('加载 PROD 地址', `http://localhost:${port}${path}`)
  }

  // 放在 loadURL 后，不然白屏
  await setZoomFactor(win, config.zoomFactor)

  return win!
}

export const createHomeWindow = async () => {
  const homeWindow = await createWindow(WindowId.HOME)
  let config = getConfig()
  setSessionProxy(config.proxyInfo)
  return homeWindow
}

export const clearAllWindow = () => {
  windowMap.clear()
  windowIdMap.clear()
}

export const getWindowId = (win: BrowserWindow) => {
  return windowIdMap.get(win)!
}
