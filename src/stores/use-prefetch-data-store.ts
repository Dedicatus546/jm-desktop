import { trpcClient } from '@/apis'
import { PrefetchData } from '@type/index'
import { clone } from 'radash'

export const usePrefetchDataStore = defineStore('prefetch-data', () => {
  const state: PrefetchData = reactive({
    imgHost: APP_STATE.prefetchData.imgHost,
    shuntList: APP_STATE.prefetchData.shuntList,
    weekCategoryList: APP_STATE.prefetchData.weekCategoryList,
    weekTypeList: APP_STATE.prefetchData.weekTypeList,
    categoryTagList: APP_STATE.prefetchData.categoryTagList,
    categoryCategoryList: APP_STATE.prefetchData.categoryCategoryList,
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
