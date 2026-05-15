import { z } from 'zod'
import { trpc } from './trpc'
import {
  closeWindow,
  createWindow,
  getWindow,
  getWindowId,
  hasWindow,
} from '@electron/module/window-manager'

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

const closeWindowRpc = trpc.procedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    const { id } = input
    closeWindow(id)
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
  closeWindow: closeWindowRpc,
  getWindowId: getWindowIdRpc,
  openSettingWindow: openSettingWindowRpc,
  openDownloadWindow: openDownloadWindowRpc,
}
