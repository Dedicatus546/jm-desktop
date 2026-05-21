import { join } from 'node:path'
import { BrowserWindow, BrowserWindowConstructorOptions, session } from 'electron'
import { getConfig, saveConfig } from './config'
import { isWindowInAvailableDisplayList, resolveProxyUrl } from '@electron/shared/utils'
import { createLogger } from './logger'
import { debounce } from 'radash'
import { MAIN_DIST, VITE_DEV_SERVER_URL } from '@electron/env'
import { getExpressServerPort } from './express-server'
import { ProxyInfo } from '@type/index'

const windowMap = new Map<string, BrowserWindow>()
const windowIdMap = new Map<BrowserWindow, string>()

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

const saveCurrentWindowInfoDebounce = debounce(
  { delay: 1000 },
  async (win: BrowserWindow, id: string) => {
    let config = getConfig()
    const windowInfo = win.getBounds()
    config.windowInfoMap.set(id, windowInfo)
    await saveConfig(config)
  },
)

const saveCurrentWindowInfo = async (win: BrowserWindow, id: string) => {
  let config = getConfig()
  const windowInfo = win.getBounds()
  config.windowInfoMap.set(id, windowInfo)
  await saveConfig(config)
}

export const createWindow = async (
  id: string,
  path: string,
  bwConfig?: BrowserWindowConstructorOptions,
) => {
  const { info } = createLogger(`window[${id}]`)
  let config = getConfig()
  let win: BrowserWindow | undefined = undefined
  const windowInfo = config.windowInfoMap.get(id)
  if (windowInfo && !isWindowInAvailableDisplayList(windowInfo)) {
    info('存在已记录的窗口位置且不在当前的显示器列表中，使用默认的窗口位置')
    // TODO fix
    // config.windowInfoMap.set(id)
    await saveConfig(config)
  }
  info('preload.mjs', join(MAIN_DIST, 'preload.mjs'))
  win = new BrowserWindow(
    Object.assign({}, bwConfig, {
      icon: join(process.env.VITE_PUBLIC!, 'electron-vite.svg'),
      webPreferences: {
        preload: join(MAIN_DIST, 'preload.mjs'),
        contextIsolation: true,
      },
      autoHideMenuBar: true,
      frame: false,
      ...(windowInfo ?? {}),
    }),
  )
  windowMap.set(id, win!)
  windowIdMap.set(win!, id)

  // 第一次启动后要记录 electron 默认设置的位置
  if (!windowInfo) {
    config.windowInfoMap.set(id, win.getBounds())
    await saveConfig(config)
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

export const createMainWindow = async () => {
  // const { info } = createLogger(`window[main]`)

  const mainWindow = await createWindow('main', '', {
    width: 1200,
    height: 600,
    minWidth: 1200,
    minHeight: 800,
  })
  let config = getConfig()
  setSessionProxy(config.proxyInfo)

  // emitter.on('configChange', async ([newConifg]) => {
  //   info('检测到配置文件变化')
  //   config = newConifg
  //   await setSessionProxy(config.proxyInfo)
  //   await setZoomFactor(mainWindow, config.zoomFactor)
  // })

  return mainWindow
}

export const clearAllWindow = () => {
  windowMap.clear()
  windowIdMap.clear()
}

export const getWindowId = (win: BrowserWindow) => {
  return windowIdMap.get(win)!
}
