import { access } from 'node:fs/promises'

// import { Display, screen } from 'electron'
import { ProxyInfo /*WindowInfo*/ } from '@type/index'

export const resolveProxyUrl = (proxyInfo: ProxyInfo | null) => {
  if (!proxyInfo) {
    return undefined
  }
  const { host, port, username, password } = proxyInfo
  const url = new URL(`http://${host}:${port}`)
  url.username = username
  url.password = password
  // 去除末尾斜杠
  return url.toString().slice(0, -1)
}

export const delay = async (ts: number) => {
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, ts)
  })
}

export const exists = async (path: string) => {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

// 如果窗口位置在某个已存在的 screen 内占据大于 50% 时，则此时认为窗口并未被严重遮挡
// export const isWindowInAvailableDisplayList = (windowInfo: WindowInfo) => {
//   const displayList = screen.getAllDisplays()
//   return displayList.some((display) => {
//     const overlapArea = getIntersectionAreaBetweenWindowAndDisplay(windowInfo, display)
//     const area = windowInfo.width * windowInfo.height
//     return overlapArea / area > 0.5
//   })
// }

// 获取窗口和屏幕的交集区域面积
// export const getIntersectionAreaBetweenWindowAndDisplay = (
//   windowInfo: WindowInfo,
//   display: Display,
// ) => {
//   const { x, y, width, height } = display.bounds
//   const { x: windowX, y: windowY, width: windowWidth, height: windowHeight } = windowInfo
//   const left = Math.max(x, windowX)
//   const right = Math.min(x + width, windowX + windowWidth)
//   const top = Math.max(y, windowY)
//   const bottom = Math.min(y + height, windowY + windowHeight)

//   const overlapWidth = right - left
//   const overlapHeight = bottom - top

//   const overlapArea = Math.max(0, overlapWidth) * Math.max(0, overlapHeight)
//   return overlapArea
// }
