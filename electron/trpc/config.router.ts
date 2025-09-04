import { Config, getConfig, saveConfig } from '@electron/module/config'
import { z } from 'zod'

import { trpc } from './trpc'

const getConfigRpc = trpc.procedure.query(async () => {
  return getConfig()
})

const saveConfigRpc = trpc.procedure
  .input(
    z.object({
      theme: z.enum(['light', 'dark', 'auto']),
      apiUrl: z.string(),
      apiUrlList: z.array(z.string()),
      readMode: z.enum(['scroll', 'click']),
      autoLogin: z.boolean(),
      loginUserInfo: z.string(),
      currentShuntKey: z.number().optional(),
      zoomFactor: z.number(),
      windowInfo: z
        .object({
          x: z.number(),
          y: z.number(),
          width: z.number(),
          height: z.number(),
        })
        .optional(),
      proxyInfo: z
        .object({
          host: z.string(),
          port: z.number(),
          username: z.string(),
          password: z.string(),
        })
        .optional(),
    }) satisfies z.ZodType<Config>,
  )
  .mutation(async ({ input: newConfig }) => {
    await saveConfig(newConfig)
  })

export const router = {
  getConfig: getConfigRpc,
  saveConfig: saveConfigRpc,
}
