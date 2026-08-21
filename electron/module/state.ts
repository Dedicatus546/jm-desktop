import { LoginInfo, PrefetchData, User, Config, WindowInfoMap, DownloadItem } from '@common/type'
import { DEFAULT_CONFIG } from '@common/constant'

export const state: {
  config: Config
  windowInfoMap: WindowInfoMap
  prefetchData: PrefetchData
  user: User | null
  loginInfo: LoginInfo | null
  downloadList: Array<DownloadItem>
} = {
  config: Object.assign({}, DEFAULT_CONFIG),
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
  downloadList: [],
}
