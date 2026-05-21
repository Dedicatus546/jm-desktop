import { trpcClient } from '@/apis'
import { createLogger } from '@/logger'
import { useConfigStore } from '@/stores/use-config-store'
import { usePrefetchDataStore } from '@/stores/use-prefetch-data-store'
import useUserStore from '@/stores/use-user-store'
import { Unsubscribable } from '@trpc/server/observable'

const { info } = createLogger('state-sync')

export const useSyncStoreTrpc = () => {
  const configStore = useConfigStore()
  const prefetchDataStore = usePrefetchDataStore()
  const userStore = useUserStore()

  const unsubscribableArray: Array<Unsubscribable> = []

  onMounted(() => {
    unsubscribableArray.push(
      trpcClient.onConfigUpdate.subscribe(undefined, {
        onData(value) {
          info('更新 config', JSON.stringify(value))
          configStore.updateFromTrpcAction(value)
        },
      }),
      trpcClient.onPrefetchDataUpdate.subscribe(undefined, {
        onData(value) {
          // info('更新 prefetchData', JSON.stringify(value))
          prefetchDataStore.updateFromTrpcAction(value)
        },
      }),
      trpcClient.onUserUpdate.subscribe(undefined, {
        onData(value) {
          // info('更新 user', JSON.stringify(value))
          userStore.updateFromTrpcAction(value)
        },
      }),
    )
  })

  onUnmounted(() => {
    unsubscribableArray.forEach((unsubscribable) => {
      unsubscribable.unsubscribe()
    })
    unsubscribableArray.length = 0
  })
}
