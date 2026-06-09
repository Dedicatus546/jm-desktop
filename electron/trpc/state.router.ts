import { createLogger } from '@electron/module/logger'
import { trpc } from './trpc'
import { state } from '@electron/module/state'
import { Config, PrefetchData, User } from '@type/index'
import { clone } from 'radash'
import { stringify } from 'superjson'
import z from 'zod'
import { ee } from '@electron/events'
import { on } from 'node:events'
import { saveConfig } from '@electron/module/config'

const { info } = createLogger('trpc-subscription')

const onConfigUpdateRpc = trpc.procedure.subscription(async function* (opts) {
  const { signal } = opts

  for await (const _ of on(ee, 'configUpdate', { signal })) {
    yield state.config
  }

  info('结束 onConfigUpdateRpc 监听')
})

const updateConfigRpc = trpc.procedure
  .input(
    z.object({
      theme: z.enum(['light', 'dark', 'auto']),
      apiUrl: z.string(),
      apiUrlList: z.array(z.string()),
      currentShuntKey: z.number().nullable(),
      readMode: z.enum(['scroll', 'click']),
      loginUserInfo: z.string(),
      zoomFactor: z.number(),
      proxyInfo: z
        .object({
          host: z.string(),
          port: z.number(),
          username: z.string(),
          password: z.string(),
        })
        .nullable(),
    }) satisfies z.Schema<Config>,
  )
  .mutation(async ({ input }) => {
    info('更新 config ，原 config ', stringify(state.config), '更新的 config', stringify(input))
    await saveConfig(input)
  })

const onUserUpdateRpc = trpc.procedure.subscription(async function* (opts) {
  const { signal } = opts

  // yield {
  //   user: clone(state.user),
  //   loginInfo: clone(state.loginInfo),
  // }

  for await (const _ of on(ee, 'userUpdate', { signal })) {
    yield clone(state.user)
  }

  info('结束 onUserUpdateRpc 监听')
})

const updateUserRpc = trpc.procedure
  .input(
    z
      .object({
        uid: z.number(),
        username: z.string(),
        email: z.string(),
        avatar: z.string(),
        jCoin: z.number(),
        level: z.tuple([z.number(), z.string()]),
        currentExp: z.number(),
        nextLevelExp: z.number(),
        collectCount: z.number(),
        maxCollectCount: z.number(),
      })
      .nullable() satisfies z.Schema<User | null>,
  )
  .mutation(async ({ input }) => {
    // user 不写入本地
    info('更新 user ，原 user ', stringify(state.user), '更新的 user', stringify(input))
    if (input !== null) {
      if (state.user) {
        Object.assign(state.user, input)
      } else {
        state.user = input
      }
    } else {
      state.user = null
    }
    ee.emit('userUpdate', state.user)
  })

const onPrefetchDataUpdateRpc = trpc.procedure.subscription(async function* (opts) {
  const { signal } = opts

  for await (const _ of on(ee, 'prefetchDataUpdate', { signal })) {
    yield state.prefetchData
  }

  info('结束 onPrefetchDataUpdateRpc 监听')
})

const updatePrefetchDataRpc = trpc.procedure
  .input(
    z.object({
      imgHost: z.string(),
      shuntList: z.array(
        z.object({
          title: z.string(),
          key: z.number(),
        }),
      ),
      weekCategoryList: z.array(
        z.object({
          id: z.number(),
          name: z.string(),
        }),
      ),
      weekTypeList: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
        }),
      ),
      categoryTagList: z.array(
        z.object({
          title: z.string(),
          list: z.array(z.string()),
        }),
      ),
      categoryCategoryList: z.array(
        z.object({
          id: z.number(),
          name: z.string(),
          type: z.enum(['slug', 'search']).optional(),
          slug: z.string(),
          subCategoryList: z.array(
            z.object({
              id: z.number(),
              name: z.string(),
              slug: z.string(),
            }),
          ),
        }),
      ),
    }) satisfies z.Schema<PrefetchData>,
  )
  .mutation(async ({ input }) => {
    info('更新 user ，原 user ', stringify(state.user), '更新的 config', stringify(input))
    if (input) {
      Object.assign(state.prefetchData, input)
    }
    ee.emit('prefetchDataUpdate', state.prefetchData)
  })

const getStateRpc = trpc.procedure.query(() => {
  return state
})

export const router = {
  onConfigUpdate: onConfigUpdateRpc,
  updateConfig: updateConfigRpc,

  onUserUpdate: onUserUpdateRpc,
  updateUser: updateUserRpc,

  onPrefetchDataUpdate: onPrefetchDataUpdateRpc,
  updatePrefetchData: updatePrefetchDataRpc,

  getState: getStateRpc,
}
