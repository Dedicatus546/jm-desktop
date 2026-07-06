import { trpcClient } from '@/trpc'
import { useConfigStore } from '@/stores/use-config-store'
import { Unsubscribable } from '@trpc/server/observable'
import { log } from '@/utils/logger'

const { info } = log

export const useSyncConfigTrpc = () => {
  const configStore = useConfigStore()

  let unsubscribable: Unsubscribable | undefined = undefined

  onMounted(() => {
    info('订阅 config 变化')
    unsubscribable = trpcClient.onConfigUpdate.subscribe(undefined, {
      onData(value) {
        info('更新 config', JSON.stringify(value))
        configStore.updateFromTrpcAction(value)
      },
    })
  })

  onUnmounted(() => {
    unsubscribable?.unsubscribe()
    info('清理 config 订阅')
  })
}
