import { trpcClient } from '@/trpc'
import { Unsubscribable } from '@trpc/server/observable'
import { log } from '@/utils/logger'
import { useDownloadStore } from '@/stores/use-download-store'

const { info } = log

export const useSyncDownloadTrpc = () => {
  const downloadStore = useDownloadStore()

  let unsubscribable: Unsubscribable

  onMounted(() => {
    info('订阅 download 变化')
    unsubscribable = trpcClient.onDownloadUpdate.subscribe(undefined, {
      onData(value) {
        info('更新 download', JSON.stringify(value))
        downloadStore.updateFromTrpcAction(value)
      },
    })
  })

  onUnmounted(() => {
    unsubscribable?.unsubscribe()
    info('清理 download 订阅')
  })
}
