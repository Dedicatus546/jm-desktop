export type Theme = 'light' | 'dark' | 'auto'

export type ReadMode = 'scroll' | 'click'

export enum WindowId {
  HOME,
  SETTING,
  LOGIN,
  ABOUT,
  SIGN,
  DOWNLOAD
}

export type WindowInfo = {
  x?: number
  y?: number
  width?: number
  height?: number
}

export type ProxyInfo = {
  host: string
  port: number
  username: string
  password: string
}

export type Config = {
  theme: Theme
  apiUrl: string
  apiUrlList: Array<string>
  currentShuntKey: number | null
  readMode: ReadMode
  loginUserInfo: string
  zoomFactor: number
  proxyInfo: ProxyInfo | null
}

export type WindowInfoMap = Map<WindowId, WindowInfo>

export type PrefetchData = {
  imgHost: string
  shuntList: Array<{
    title: string
    key: number
  }>
  weekCategoryList: Array<{
    id: number
    name: string
  }>
  weekTypeList: Array<{
    id: string
    name: string
  }>
  categoryTagList: Array<{
    title: string
    list: Array<string>
  }>
  categoryCategoryList: Array<{
    id: number
    name: string
    type?: 'slug' | 'search'
    slug: string
    subCategoryList: Array<{
      id: number
      name: string
      slug: string
    }>
  }>
}

export type User = {
  uid: number
  username: string
  email: string
  avatar: string
  jCoin: number
  level: [number, string]
  currentExp: number
  nextLevelExp: number
  collectCount: number
  maxCollectCount: number
}

export type LoginInfo = {
  username: string // 加密
  password: string // 加密
}
