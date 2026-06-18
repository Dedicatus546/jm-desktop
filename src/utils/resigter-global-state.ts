import { trpcClient } from '@/trpc'
import { Config, DownloadItem, LoginInfo, PrefetchData, User, WindowId } from '@common/type'

declare global {
  // 定义你的状态结构
  interface AppState {
    config: Config
    prefetchData: PrefetchData
    user: User | null
    loginInfo: LoginInfo | null
    downloadList: Array<DownloadItem>
  }

  // 这样直接写，可以让前端直接使用 `appState.config`
  const APP_STATE: AppState
  const WINDOW_ID: WindowId

  // 这样写，可以让前端使用 `window.appState.config` 并且不报错
  interface Window {
    APP_STATE: AppState
    WINDOW_ID: WindowId
  }
}

export const registerGlobalState = async () => {
  window.APP_STATE = await trpcClient.getState.query()
  window.WINDOW_ID = await trpcClient.getWindowId.query()
}
