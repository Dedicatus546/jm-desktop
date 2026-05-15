import { createLogger } from '@electron/module/logger'
import { trpc } from './trpc'
import { state } from '@electron/module/state'
import { Config, PrefetchData, User } from '@type/index'
import { assign, clone } from 'radash'
import { stringify } from 'superjson'
import z from 'zod'

const { info } = createLogger('state')

const onConfigUpdateRpc = trpc.procedure.subscription(async function* (opts) {
  const { signal } = opts
  while (!signal?.aborted) {
    // TODO
    await new Promise((resolve) => setTimeout(resolve, 1000))
    yield clone(state.config)
  }
})

const updateConfigRpc = trpc.procedure
  .input(
    z.object({
      theme: z.enum(['light', 'dark', 'auto']),
      apiUrl: z.string(),
      apiUrlList: z.array(z.string()),
      currentShuntKey: z.number().nullable(),
      readMode: z.enum(['scroll', 'click']),
      autoLogin: z.boolean(),
      loginUserInfo: z.string(),
      zoomFactor: z.number(),
      windowInfoMap: z.map(
        z.string(),
        z.object({
          x: z.number(),
          y: z.number(),
          width: z.number(),
          height: z.number(),
        }),
      ),
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
    assign(state.config, input)
  })

const onUserUpdateRpc = trpc.procedure.subscription(async function* (opts) {
  const { signal } = opts
  while (!signal?.aborted) {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    yield {
      user: clone(state.user),
      loginInfo: clone(state.loginInfo),
    }
  }
})

const updateUserRpc = trpc.procedure
  .input(
    z.object({
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
    }) satisfies z.Schema<User>,
  )
  .mutation(async ({ input }) => {
    info('更新 user ，原 user ', stringify(state.user), '更新的 config', stringify(input))
    if (input) {
      if (state.user) {
        assign(state.user, input)
      } else {
        state.user = input
      }
    }
  })

const onPrefetchDataUpdateRpc = trpc.procedure.subscription(async function* (opts) {
  const { signal } = opts
  while (!signal?.aborted) {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    yield clone(state.prefetchData)
  }
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
          type: z.enum(['slug', 'search']),
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
      assign(state.prefetchData, input)
    }
  })

export const router = {
  onConfigUpdate: onConfigUpdateRpc,
  updateConfig: updateConfigRpc,

  onUserUpdate: onUserUpdateRpc,
  updateUser: updateUserRpc,

  onPrefetchDataUpdate: onPrefetchDataUpdateRpc,
  updatePrefetchData: updatePrefetchDataRpc,
}
