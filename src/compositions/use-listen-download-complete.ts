import { trpcClient } from '@/trpc'
import { Unsubscribable } from '@trpc/server/observable'
import { log } from '@/utils/logger'
import { WindowType } from '@common/type'
import { encodeToBase64 } from '@/utils/base64'

const { info } = log

// 来自 deepseek
const playNotificationSound = () => {
  // 使用 Web Audio API 生成一个简单的提示音
  const audioCtx = new window.AudioContext()

  // 播放一个清脆的 "叮" 声
  const oscillator = audioCtx.createOscillator()
  const gainNode = audioCtx.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioCtx.destination)

  oscillator.frequency.value = 880 // A5 音符
  oscillator.type = 'sine'

  gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3)

  oscillator.start(audioCtx.currentTime)
  oscillator.stop(audioCtx.currentTime + 0.3)
}

export const useListenDownloadComplete = () => {
  let unsubscribable: Unsubscribable

  onMounted(() => {
    info('订阅 downloadComplete 变化')
    unsubscribable = trpcClient.onDownloadComplete.subscribe(undefined, {
      async onData(item) {
        const title = `[${item.comicId}] ${item.comicName} ${item.chapterName}`
        const uuid = await trpcClient.getUUID.query()
        trpcClient.openWindow.mutate({
          id: uuid,
          type: WindowType.NOTIFICATION,
          query: {
            q: encodeToBase64(
              JSON.stringify({
                type: 'base',
                title,
                body: '下载成功',
                duration: 5000,
              }),
            ),
          },
        })
        playNotificationSound()
      },
    })
  })

  onUnmounted(() => {
    unsubscribable?.unsubscribe()
    info('清理 downloadComplete 订阅')
  })
}
