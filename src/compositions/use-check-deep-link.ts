import { trpcClient } from '@/trpc'
import { log } from '@/utils/logger'
import { Unsubscribable } from '@trpc/server/observable'

const { info } = log

export const useCheckDeepLink = () => {
  const router = useRouter()

  let unsubscribable: Unsubscribable | undefined = undefined

  const resolveUrl = (url: string) => {
    const u = new URL(url)
    const comicId = u.hostname
    router.push({
      name: 'COMIC_DETAIL',
      params: {
        id: comicId,
      },
    })
  }

  onMounted(async () => {
    unsubscribable = trpcClient.onDeepLinkUpdate.subscribe(undefined, {
      onData(url) {
        if (url) {
          info('检测到运行中点击了深度链接启动，链接为 ' + url)
          resolveUrl(url)
        }
      },
    })
    const url = await trpcClient.getDeepLink.query()
    if (url) {
      info('检测到通过深度链接启动，链接为 ' + url)
      resolveUrl(url)
    }
  })

  onUnmounted(() => {
    unsubscribable?.unsubscribe()
    info('清理 onDeepLinkUpdate 订阅')
  })
}
