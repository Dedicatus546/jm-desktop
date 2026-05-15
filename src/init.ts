import { useRequest } from 'alova/client'
import { getSettingApi, trpcClient } from './apis'

const { promise, resolve, reject } = Promise.withResolvers<void>()

export let initPromise = promise

export const init = async () => {
  try {
    const id = await trpcClient.getWindowId.query()
    if (id === 'main') {
      // 只需在主窗口初始化
      const settingReq = useRequest(() => getSettingApi())
    }
  } catch (e) {
    reject(e)
  }
}
