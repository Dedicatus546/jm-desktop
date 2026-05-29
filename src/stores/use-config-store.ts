import { Config } from '@type/index'
import { useTheme } from 'vuetify'

import { trpcClient } from '@/apis'
import { clone } from 'radash'

export const useConfigStore = defineStore('config', () => {
  const theme = useTheme()
  const isDark = usePreferredDark()

  const state: Config = reactive({
    theme: APP_STATE.config.theme,
    apiUrl: APP_STATE.config.apiUrl,
    apiUrlList: APP_STATE.config.apiUrlList,
    readMode: APP_STATE.config.readMode,
    currentShuntKey: APP_STATE.config.currentShuntKey,
    loginUserInfo: APP_STATE.config.loginUserInfo,
    proxyInfo: APP_STATE.config.proxyInfo,
    zoomFactor: APP_STATE.config.zoomFactor,
  })

  const updateConfigAction = async (config: Partial<Config>) => {
    const newConfig = clone(state)
    Object.assign(newConfig, config)
    await trpcClient.updateConfig.mutate(newConfig)
  }

  const updateFromTrpcAction = (config: Config) => {
    Object.assign(state, config)
  }

  watch(isDark, (isDark) => {
    if (state.theme === 'auto') {
      theme.change(isDark ? 'dark' : 'light')
    }
  })

  return {
    state,
    updateConfigAction,
    updateFromTrpcAction,
  }
})
