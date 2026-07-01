import { z } from 'zod'
import { trpc } from './trpc'
import { getWindowId, showWindow } from '@main/module/window-manager'
import { WindowType } from '@common/type'
import { app } from 'electron'

const getWindowIdRpc = trpc.procedure.query(async ({ ctx }) => {
  const win = ctx.win
  const id = getWindowId(win)
  return id
})

const openWindowRpc = trpc.procedure
  .input(
    z.object({
      id: z.string(),
      type: z.enum(WindowType),
      query: z.record(z.string(), z.any()).optional(),
    }),
  )
  .mutation(async ({ input }) => {
    showWindow(input.id, input.type, input.query)
  })

const closeWindowRpc = trpc.procedure.mutation(({ ctx }) => {
  const { winId } = ctx
  const win = ctx.win
  win.close()
  if (winId === WindowType.HOME) {
    app.exit()
  }
})

const minimizeWindowRpc = trpc.procedure.mutation(({ ctx }) => {
  const win = ctx.win
  win.minimize()
})

export const router = {
  getWindowId: getWindowIdRpc,
  // openSettingWindow: openSettingWindowRpc,
  // openLoginWindow: openLoginWindowRpc,
  // openDownloadWindow: openDownloadWindowRpc,
  // openAboutWindow: openAboutWindowRpc,
  openWindow: openWindowRpc,
  closeWindow: closeWindowRpc,
  minimizeWindow: minimizeWindowRpc,
}
