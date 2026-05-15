import { LoginInfo, PrefetchData, User, Config } from '@type/index'

export const state: {
  config: Config
  prefetchData: PrefetchData
  user: User | null
  loginInfo: LoginInfo | null
} = {
  config: {
    theme: 'light',
    apiUrl: 'https://www.cdngwc.cc',
    apiUrlList: [
      'https://www.cdnhth.club',
      'https://www.cdnzack.cc',
      'https://www.jmapiproxyxxx.vip',
      'https://www.cdnxxx-proxy.xyz',
      'https://www.jmeadpoolcdn.life',
      'https://jmcomicne.net',
      'https://www.cdngwc.cc',
    ],
    currentShuntKey: null,
    readMode: 'scroll',
    autoLogin: false,
    loginUserInfo: '',
    zoomFactor: 0,
    windowInfoMap: new Map(),
    proxyInfo: null,
  },
  prefetchData: {
    imgHost: '',
    shuntList: [],
    weekCategoryList: [],
    weekTypeList: [],
    categoryTagList: [],
    categoryCategoryList: [],
  },
  user: null,
  loginInfo: null,
}
