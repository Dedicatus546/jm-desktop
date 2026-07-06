import { trpcClient } from '@/trpc'
import { Unsubscribable } from '@trpc/server/observable'
import useUserStore from '@/stores/use-user-store'
import { log } from '@/utils/logger'

const { info } = log

export const useSyncUserTrpc = () => {
  const userStore = useUserStore()

  let unsubscribable: Unsubscribable | undefined = undefined

  onMounted(() => {
    info('订阅 user 变化')
    unsubscribable = trpcClient.onUserUpdate.subscribe(undefined, {
      onData(value) {
        info('更新 user', JSON.stringify(value))
        userStore.updateFromTrpcAction(value)
      },
    })
  })

  onUnmounted(() => {
    unsubscribable?.unsubscribe()
    info('清理 user 订阅')
  })
}
