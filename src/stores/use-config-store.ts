import { Config } from '@type/index'
import { useTheme } from 'vuetify'

import { trpcClient } from '@/apis'
import { clone } from 'radash'

export const useConfigStore = defineStore('config', () => {
  const theme = useTheme()
  const isDark = usePreferredDark()

  const state: Config = reactive({
    theme: appState.config.theme,
    apiUrl: appState.config.apiUrl,
    apiUrlList: appState.config.apiUrlList,
    readMode: appState.config.readMode,
    currentShuntKey: appState.config.currentShuntKey,
    loginUserInfo: appState.config.loginUserInfo,
    windowInfoMap: appState.config.windowInfoMap,
    proxyInfo: appState.config.proxyInfo,
    zoomFactor: appState.config.zoomFactor,
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
