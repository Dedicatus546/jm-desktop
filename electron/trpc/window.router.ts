import { z } from 'zod'
import { trpc } from './trpc'
import { createWindow, getWindow, getWindowId, hasWindow } from '@electron/module/window-manager'

const openWindowRpc = trpc.procedure
  .input(
    z.object({
      id: z.string(),
      path: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    const { path, id } = input
    createWindow(id, path)
  })

const getWindowIdRpc = trpc.procedure.query(async ({ ctx }) => {
  const win = ctx.win
  const id = getWindowId(win)
  return id
})

const openSettingWindowRpc = trpc.procedure.query(async () => {
  if (hasWindow('config')) {
    const win = getWindow('config')
    // 聚焦提升到最顶层
    win!.focus()
    return
  }
  await createWindow('config', '/config', {
    width: 800,
    height: 600,
  })
})

const openLoginWindowRpc = trpc.procedure.query(async () => {
  if (hasWindow('login')) {
    const win = getWindow('login')
    // 聚焦提升到最顶层
    win!.focus()
    return
  }
  await createWindow('login', '/login', {
    width: 600,
    height: 600,
    resizable: false,
  })
})

const openDownloadWindowRpc = trpc.procedure.query(async () => {
  if (hasWindow('download')) {
    const win = getWindow('download')
    // 聚焦提升到最顶层
    win!.focus()
    return
  }
  await createWindow('download', '/download', {
    width: 800,
    height: 600,
  })
})

export const router = {
  openWindow: openWindowRpc,
  getWindowId: getWindowIdRpc,
  openSettingWindow: openSettingWindowRpc,
  openLoginWindow: openLoginWindowRpc,
  openDownloadWindow: openDownloadWindowRpc,
}
