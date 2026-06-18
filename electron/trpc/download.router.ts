import log from 'electron-log/main'

import { getDonwloadList, addDownloadItem } from '@main/module/download'
import { z } from 'zod'

import { trpc } from './trpc'
import { on } from 'node:events'
import { ee } from '@main/events'
import { state } from '@main/module/state'
import { tryDownloadService } from '@main/service/download.service'

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
    await addDownloadItem({
      comicId: input.comicId,
      comicName: input.comicName,
      chapterName: input.chapterName,
      picUrlList: input.picUrlList,
      scrambleId: input.scrambleId,
      speed: input.speed,
    })
    tryDownloadService()
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

export const router = {
  addDownloadItem: addDownloadItemRpc,
  onDownloadUpdate: onDownloadUpdateRpc,
  getDownloadList: getDownloadListRpc,
}
