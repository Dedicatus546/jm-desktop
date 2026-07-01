import log from 'electron-log/main'

import {
  getDonwloadList,
  addDownloadItem,
  updateDownloadItem,
  downloadDir,
} from '@main/module/download'
import { z } from 'zod'

import { trpc } from './trpc'
import { on } from 'node:events'
import { ee } from '@main/events'
import { state } from '@main/module/state'
import { downloadService } from '@main/service/download.service'
import { resolve } from 'node:path'
import { shell } from 'electron'

const createChainAbortController = (signal: AbortSignal | undefined) => {
  const ac = new AbortController()
  if (signal) {
    signal.addEventListener('abort', () => {
      ac.abort()
    })
  }
  return ac
}

const addDownloadItemRpc = trpc.procedure
  .input(
    z.object({
      belongComicId: z.number(),
      comicId: z.number(),
      comicName: z.string(),
      chapterName: z.string(),
      picUrlList: z.array(z.string()),
      scrambleId: z.number(),
      speed: z.string(),
    }),
  )
  .mutation(async function (opts) {
    const { input } = opts
    const item = await addDownloadItem({
      belongComicId: input.belongComicId,
      comicId: input.comicId,
      comicName: input.comicName,
      chapterName: input.chapterName,
      picUrlList: input.picUrlList,
      scrambleId: input.scrambleId,
      speed: input.speed,
    })
    if (item) {
      downloadService(item.comicId)
    }
  })

const getDownloadListRpc = trpc.procedure.query(() => {
  return getDonwloadList()
})

const onDownloadUpdateRpc = trpc.procedure.subscription(async function* (opts) {
  const { signal, ctx } = opts
  const ac = createChainAbortController(signal)

  ctx.win.once('close', () => {
    ac.abort()
  })

  for await (const _ of on(ee, 'downloadUpdate', { signal: ac.signal })) {
    yield state.downloadList
  }

  log.info('结束 onDownloadUpdate 监听')
})

const resetDownloadItemRpc = trpc.procedure
  .input(z.array(z.number()))
  .mutation(async ({ input }) => {
    for (const comicId of input) {
      const item = state.downloadList.find((item) => item.comicId === comicId)
      if (item) {
        await updateDownloadItem(item.comicId, {
          filepath: '',
          status: 'pending',
          percent: 0,
        })
      }
    }
  })

const downloadRpc = trpc.procedure.input(z.number()).mutation(async ({ input }) => {
  downloadService(input)
})

const openDownloadItemDirRpc = trpc.procedure.input(z.number()).mutation(({ input }) => {
  const item = state.downloadList.find((item) => item.comicId === input)
  if (item) {
    const { filepath } = item
    const absoluteFilepath = resolve(downloadDir, filepath)
    shell.showItemInFolder(absoluteFilepath)
  }
})

export const router = {
  addDownloadItem: addDownloadItemRpc,
  onDownloadUpdate: onDownloadUpdateRpc,
  getDownloadList: getDownloadListRpc,
  resetDownloadItem: resetDownloadItemRpc,
  download: downloadRpc,
  openDownloadItemDir: openDownloadItemDirRpc,
}
