import { trpc } from './trpc'
import { createWindow, getWindow, getWindowId, hasWindow } from '@electron/module/window-manager'
import { WindowId } from '@type/index'

const getWindowIdRpc = trpc.procedure.query(async ({ ctx }) => {
  const win = ctx.win
  const id = getWindowId(win)
  return id
})

const openSettingWindowRpc = trpc.procedure.query(async () => {
  if (hasWindow(WindowId.SETTING)) {
    const win = getWindow(WindowId.SETTING)!
    if (win.isMinimized()) {
      win.restore()
    }
    // 聚焦提升到最顶层
    win.focus()
    return
  }
  await createWindow(WindowId.SETTING)
})

const openLoginWindowRpc = trpc.procedure.query(async () => {
  if (hasWindow(WindowId.LOGIN)) {
    const win = getWindow(WindowId.LOGIN)!
    if (win.isMinimized()) {
      win.restore()
    }
    // 聚焦提升到最顶层
    win.focus()
    return
  }
  await createWindow(WindowId.LOGIN)
})

const openDownloadWindowRpc = trpc.procedure.query(async () => {
  // TODO fix
  // if (hasWindow('download')) {
  //   const win = getWindow('download')!
  //   if (win.isMinimized()) {
  //     win.restore()
  //   }
  //   // 聚焦提升到最顶层
  //   win.focus()
  //   return
  // }
  // await createWindow('download', '/download', {
  //   width: 800,
  //   height: 600,
  // })
})

export const router = {
  getWindowId: getWindowIdRpc,
  openSettingWindow: openSettingWindowRpc,
  openLoginWindow: openLoginWindowRpc,
  openDownloadWindow: openDownloadWindowRpc,
}
