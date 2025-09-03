import { Config } from '@electron/module/config'
import { useTheme } from 'vuetify'

import { trpcClient } from '@/apis'

interface State {
  config: Config
  signIn: {
    modalOpen: boolean
    info: {
      id: number
      name: string
      threeDaysCoinCount: number
      threeDaysExpCount: number
      sevenDaysCoinCount: number
      sevenDaysExpCount: number
      pcBackground: string
      mobileBackground: string
      currentProgress: number
      dateMap: Record<
        string,
        {
          isNextDaySign: boolean
          isLastDaySign: boolean
          isSign: boolean
          hasExtraBonus: boolean
        }
      > | null
    }
  }
  setting: {
    logoPath: string
    webHost: string
    imgHost: string
    baseUrl: string
    cnBaseUrl: string
    version: string
    storeLink: {
      google: string
      web: string
    }
    shuntList: Array<{ title: string, key: number }>
  }
  data: {
    weekCategoryList: Array<{
      id: number
      name: string
    }>
    weekTypeList: Array<{
      id: string
      name: string
    }>
  }
}

const useAppStore = defineStore('app', () => {
  const theme = useTheme()
  const isDark = usePreferredDark()
  const state = reactive<State>({
    config: {
      theme: 'dark',
      apiUrl: '',
      apiUrlList: [],
      readMode: 'scroll',
      currentShuntKey: undefined,
      autoLogin: false,
      loginUserInfo: '',
      windowInfo: undefined,
      proxyInfo: undefined,
      zoomFactor: 0,
    },
    signIn: {
      modalOpen: false,
      info: {
        id: 0,
        name: '',
        threeDaysCoinCount: 0,
        threeDaysExpCount: 0,
        sevenDaysCoinCount: 0,
        sevenDaysExpCount: 0,
        pcBackground: '',
        mobileBackground: '',
        currentProgress: 0,
        dateMap: null,
      },
    },
    setting: {
      logoPath: '',
      webHost: '',
      imgHost: '',
      baseUrl: '',
      cnBaseUrl: '',
      version: '',
      storeLink: {
        google: '',
        web: '',
      },
      shuntList: [],
    },
    data: {
      weekCategoryList: [],
      weekTypeList: [],
    },
  })

  const updateSettingAction = (setting: Partial<State['setting']>) => {
    Object.assign(state.setting, setting)
  }

  const updateConfigAction = async (
    config: Partial<State['config']>,
    sync = false,
  ) => {
    if (config.theme) {
      if (config.theme === 'auto') {
        theme.change(isDark.value ? 'dark' : 'light')
      }
      else {
        theme.change(config.theme)
      }
    }
    state.config = {
      ...state.config,
      ...config,
    }
    if (sync) {
      await trpcClient.saveConfig.mutate(state.config)
    }
  }

  watch(isDark, (isDark) => {
    if (state.config.theme === 'auto') {
      theme.change(isDark ? 'dark' : 'light')
    }
  })

  return {
    ...toRefs(state),
    updateSettingAction,
    updateConfigAction,
  }
})

export default useAppStore
