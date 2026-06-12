import { useRequest } from 'alova/client'

import { loginApi } from '@/apis'
import useUserStore from '@/stores/use-user-store'
import { useConfigStore } from '@/stores/use-config-store'
import { trpcClient } from '@/trpc'
import { log } from '@/utils/logger'

const { info } = log

export const useRefreshUser = () => {
  const userStore = useUserStore()
  const configStore = useConfigStore()
  const { data, send, onSuccess, onError } = useRequest(
    (username: string, password: string) => loginApi({ username, password }),
    {
      immediate: false,
    },
  )
  onSuccess(() => {
    userStore.updateUserAction(data.value!.data)
  })
  onError(() => {
    userStore.updateUserAction(null)
  })
  const { resume, pause } = useIntervalFn(
    async () => {
      info('刷新用户信息中...')
      const loginInfo = await trpcClient.decryptLoginUser.query(configStore.state.loginUserInfo)
      const { username, password } = loginInfo
      send(username, password)
    },
    5 * 60 * 1000,
    {
      immediate: false,
    },
  )
  watch(
    () => userStore.isLogin,
    (isLogin) => {
      if (isLogin) {
        info('检测到已登录，开始定时刷新用户，防止登录信息失效。')
        resume()
      } else {
        info('检测未登录或退出登录，关闭定时刷新用户。')
        pause()
      }
    },
    {
      immediate: true,
    },
  )
}
