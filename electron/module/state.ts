import { LoginInfo, PrefetchData, User, Config, WindowInfoMap } from '@type/index'

export const state: {
  config: Config
  windowInfoMap: WindowInfoMap
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
    loginUserInfo: '',
    zoomFactor: 1.0,
    proxyInfo: null,
  },
  windowInfoMap: new Map(),
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
