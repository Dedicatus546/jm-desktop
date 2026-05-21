import { trpcClient } from '@/apis'
import { PrefetchData } from '@type/index'
import { clone } from 'radash'

export const usePrefetchDataStore = defineStore('prefetch-data', () => {
  const state: PrefetchData = reactive({
    imgHost: appState.prefetchData.imgHost,
    shuntList: appState.prefetchData.shuntList,
    weekCategoryList: appState.prefetchData.weekCategoryList,
    weekTypeList: appState.prefetchData.weekTypeList,
    categoryTagList: appState.prefetchData.categoryTagList,
    categoryCategoryList: appState.prefetchData.categoryCategoryList,
  })
  const isInit = ref(false)

  const updateFromTrpcAction = (prefetchData: PrefetchData) => {
    Object.assign(state, prefetchData)
  }

  const updatePrefetchDataAction = async (prefetchData: Partial<PrefetchData>) => {
    const newPrefetchData = clone(state)
    Object.assign(newPrefetchData, prefetchData)
    await trpcClient.updatePrefetchData.mutate(newPrefetchData)
  }

  return {
    isInit,
    state,
    updateFromTrpcAction,
    updatePrefetchDataAction,
  }
})
