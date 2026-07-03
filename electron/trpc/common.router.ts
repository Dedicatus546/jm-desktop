import { createCipheriv, createDecipheriv, createHash } from 'node:crypto'
import log from 'electron-log/main'
import { dialog, shell } from 'electron'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'

import { trpc } from './trpc'
import { on } from 'node:events'
import { ee, EventEmitterMap } from '@main/events'

const logger = log.scope('trpc-subscription')

const createChainAbortController = (signal: AbortSignal | undefined) => {
  const ac = new AbortController()
  if (signal) {
    signal.addEventListener('abort', () => {
      ac.abort()
    })
  }
  return ac
}

const openLinkRpc = trpc.procedure
  .input(
    z.object({
      url: z.string(),
    }),
  )
  .mutation(({ input }) => {
    shell.openExternal(input.url)
  })

const showItemInFolderRpc = trpc.procedure
  .input(
    z.object({
      path: z.string(),
    }),
  )
  .mutation(({ input }) => {
    shell.showItemInFolder(input.path)
  })

const selectFolderRpc = trpc.procedure.mutation(async ({ ctx }) => {
  const { win } = ctx
  const result = await dialog.showOpenDialog(win, {
    properties: ['openDirectory'],
  })
  return result.filePaths[0]
})

const md5Rpc = trpc.procedure.input(z.string()).query(async ({ input }) => {
  return createHash('md5').update(input).digest('hex')
})

const decodeHttpDataRpc = trpc.procedure
  .input(
    z.object({
      data: z.string(),
      key: z.string(),
    }),
  )
  .query(async ({ input }) => {
    const { data, key } = input
    const decipher = createDecipheriv('aes-256-ecb', Buffer.from(key, 'utf-8'), null)
    let result = decipher.update(data, 'base64', 'utf8')
    result += decipher.final('utf8')
    decipher.destroy()
    return result
  })

// 32 位
const key = Buffer.from(
  createHash('sha256').update('cm-desktop-key').digest('hex').slice(0, 32),
  'utf-8',
)

// 16位
const iv = Buffer.from(
  createHash('sha256').update('cm-desktop-iv').digest('hex').slice(0, 16),
  'utf-8',
)

const encryptLoginUserRpc = trpc.procedure
  .input(
    z.object({
      username: z.string(),
      password: z.string(),
    }),
  )
  .query(async ({ input }) => {
    const { username, password } = input
    const cipher = createCipheriv('aes-256-cbc', key, iv)
    let result = cipher.update(
      JSON.stringify({
        username,
        password,
      }),
      'utf-8',
      'base64',
    )
    result += cipher.final('base64')

    return result
  })

export const decryptLoginUserRpc = trpc.procedure.input(z.string()).query(async ({ input }) => {
  const decipher = createDecipheriv('aes-256-cbc', key, iv)
  let result = decipher.update(input, 'base64', 'utf-8')
  result += decipher.final('utf-8')
  return JSON.parse(result) as { username: string; password: string }
})

const onNotifyMessageRpc = trpc.procedure.subscription(async function* (opts) {
  const { signal, ctx } = opts
  const ac = createChainAbortController(signal)

  ctx.win.once('close', () => {
    ac.abort()
  })

  for await (const [{ type, message }] of on(ee, 'messageNotify', {
    signal: ac.signal,
  })) {
    yield {
      type: type,
      message: message,
    } as EventEmitterMap['messageNotify'][0]
  }

  logger.info('结束 onNotifyMessage 监听')
})

const notifyMessageRpc = trpc.procedure
  .input(
    z.object({
      type: z.enum(['primary', 'success', 'warning', 'error']),
      message: z.string(),
    }),
  )
  .mutation(({ input }) => {
    const { type, message } = input
    ee.emit('messageNotify', {
      type,
      message,
    })
  })

const getUUIDRpc = trpc.procedure.query(() => {
  return randomUUID()
})

const getDeepLinkRpc = trpc.procedure.query(() => {
  logger.info({
    'process.argv': process.argv,
  })
  const url = process.argv.find((arg) => arg.startsWith('jm-desktop://'))
  return url
})

const onDeepLinkUpdateRpc = trpc.procedure.subscription(async function* (opts) {
  const { signal, ctx } = opts
  const ac = createChainAbortController(signal)

  ctx.win.once('close', () => {
    ac.abort()
  })

  for await (const [url] of on(ee, 'deepLinkUpdate', { signal: ac.signal })) {
    yield url as string | undefined
  }

  logger.info('结束 onDeepLinkUpdate 监听')
})

export const router = {
  openLink: openLinkRpc,
  showItemInFolder: showItemInFolderRpc,
  selectFolder: selectFolderRpc,
  md5: md5Rpc,
  decodeHttpData: decodeHttpDataRpc,
  encryptLoginUser: encryptLoginUserRpc,
  decryptLoginUser: decryptLoginUserRpc,

  onNotifyMessage: onNotifyMessageRpc,
  notifyMessage: notifyMessageRpc,
  getUUID: getUUIDRpc,
  getDeepLink: getDeepLinkRpc,
  onDeepLinkUpdate: onDeepLinkUpdateRpc,
}
