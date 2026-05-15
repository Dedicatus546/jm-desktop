import { trpcClient } from '@/apis'
import { useConfigStore } from '@/stores/use-config-store'
import { usePrefetchDataStore } from '@/stores/use-prefetch-data-store'
import useUserStore from '@/stores/use-user-store'
import { Unsubscribable } from '@trpc/server/observable'

export const useSyncStoreTrpc = () => {
  const configStore = useConfigStore()
  const prefetchDataStore = usePrefetchDataStore()
  const userStore = useUserStore()

  const unsubscribableArray: Array<Unsubscribable> = []

  onMounted(() => {
    unsubscribableArray.push(
      trpcClient.onConfigUpdate.subscribe(undefined, {
        onData(value) {
          configStore.updateFromTrpcAction(value)
        },
      }),
      trpcClient.onPrefetchDataUpdate.subscribe(undefined, {
        onData(value) {
          prefetchDataStore.updateFromTrpcAction(value)
        },
      }),
      trpcClient.onUserUpdate.subscribe(undefined, {
        onData(value) {
          userStore.updateFromTrpcAction(value.user, value.loginInfo)
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
