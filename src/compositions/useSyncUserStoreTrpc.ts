import { trpcClient } from '@/trpc'
import { createLogger } from '@/utils/logger'
import useUserStore from '@/stores/use-user-store'
import { Unsubscribable } from '@trpc/server/observable'

const { info } = createLogger('subscribe')

export const useSyncUserStoreTrpc = () => {
  const userStore = useUserStore()

  const unsubscribableArray: Array<Unsubscribable> = []

  onMounted(() => {
    unsubscribableArray.push(
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
    info('执行 subscribe 清理')
  })
}
