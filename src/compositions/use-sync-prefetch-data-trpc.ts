import { trpcClient } from '@/trpc'
import { createLogger } from '@/utils/logger'
import { Unsubscribable } from '@trpc/server/observable'
import { usePrefetchDataStore } from '@/stores/use-prefetch-data-store'

const { info } = createLogger('subscribe')

export const useSyncPrefetchDataTrpc = () => {
  const prefetchDataStore = usePrefetchDataStore()

  let unsubscribable: Unsubscribable | undefined = undefined

  onMounted(() => {
    info('订阅 prefetchdata 变化')
    unsubscribable = trpcClient.onPrefetchDataUpdate.subscribe(undefined, {
      onData(value) {
        info('更新 prefetchdata', JSON.stringify(value))
        prefetchDataStore.updateFromTrpcAction(value)
      },
    })
  })

  onUnmounted(() => {
    unsubscribable?.unsubscribe()
    info('清理 prefetchdata 订阅')
  })
}
