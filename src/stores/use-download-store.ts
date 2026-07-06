import { DownloadItem } from '@common/type'

import { trpcClient } from '@/trpc'
import { delay } from '@/utils'

export const useDownloadStore = defineStore('download', () => {
  const state = reactive<{
    activeTabKey: 'downloading' | 'complete' | 'pending'
    downloadList: Array<DownloadItem>
  }>({
    activeTabKey: 'pending',
    downloadList: APP_STATE.downloadList,
  })

  const pendingList = computed(() => state.downloadList.filter((item) => item.status === 'pending'))
  const downloadingList = computed(() =>
    state.downloadList.filter((item) => item.status === 'downloading'),
  )
  const completeList = computed(() =>
    state.downloadList.filter((item) => item.status === 'complete'),
  )
  const pendingMap = computed(() =>
    pendingList.value.reduce(
      (acc, item) => {
        acc[item.comicId] = item
        return acc
      },
      {} as Record<DownloadItem['comicId'], DownloadItem>,
    ),
  )
  const downloadingMap = computed(() =>
    downloadingList.value.reduce(
      (acc, item) => {
        acc[item.comicId] = item
        return acc
      },
      {} as Record<DownloadItem['comicId'], DownloadItem>,
    ),
  )
  const completeMap = computed(() =>
    completeList.value.reduce(
      (acc, item) => {
        acc[item.comicId] = item
        return acc
      },
      {} as Record<DownloadItem['comicId'], DownloadItem>,
    ),
  )

  const addDownloadItemAction = async (query: {
    belongComicId: number
    comicId: number
    comicName: string
    chapterName: string
    picUrlList: Array<string>
    scrambleId: number
    speed: string
  }) => {
    await trpcClient.addDownloadItem.mutate({
      belongComicId: query.belongComicId,
      comicId: query.comicId,
      comicName: query.comicName,
      chapterName: query.chapterName,
      picUrlList: query.picUrlList,
      scrambleId: query.scrambleId,
      speed: query.speed,
    })
  }

  const updateFromTrpcAction = async (downloadList: Array<DownloadItem>) => {
    state.downloadList = downloadList
  }

  const checkAndStartAction = async () => {
    if (downloadingList.value.length > 0) {
      await trpcClient.resetDownloadItem.mutate(downloadingList.value.map((item) => item.comicId))
      await delay(1000)
    }
    if (pendingList.value.length > 0) {
      pendingList.value.forEach((item) => {
        trpcClient.download.mutate(item.comicId)
      })
    }
  }

  return {
    ...toRefs(state),
    pendingList,
    pendingMap,
    downloadingList,
    downloadingMap,
    completeList,
    completeMap,
    addDownloadItemAction,
    updateFromTrpcAction,
    checkAndStartAction,
  }
})
