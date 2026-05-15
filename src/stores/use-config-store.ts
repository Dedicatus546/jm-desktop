import { Config } from '@type/index'
import { useTheme } from 'vuetify'

import { trpcClient } from '@/apis'
import { assign, clone } from 'radash'

export const useConfigStore = defineStore('config', () => {
  const theme = useTheme()
  const isDark = usePreferredDark()

  const state: Config = reactive({
    theme: 'dark',
    apiUrl: '',
    apiUrlList: [],
    readMode: 'scroll',
    currentShuntKey: null,
    autoLogin: false,
    loginUserInfo: '',
    windowInfoMap: new Map(),
    proxyInfo: null,
    zoomFactor: 0,
  })

  const updateConfigAction = async (config: Partial<Config>) => {
    const newConfig = clone(state)
    assign(newConfig, config)
    await trpcClient.updateConfig.mutate(newConfig)
  }

  const updateFromTrpcAction = (config: Config) => {
    assign(state, config)
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
