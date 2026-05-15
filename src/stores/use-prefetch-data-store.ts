import { PrefetchData } from '@type/index'
import { assign } from 'radash'

export const usePrefetchDataStore = defineStore('prefetch-data', () => {
  const state = reactive<PrefetchData>({
    imgHost: '',
    shuntList: [],
    weekCategoryList: [],
    weekTypeList: [],
    categoryTagList: [],
    categoryCategoryList: [],
  })
  const isInit = ref(false)

  const updateFromTrpcAction = (prefetchData: PrefetchData) => {
    assign(state, prefetchData)
  }

  return {
    isInit,
    state,
    updateFromTrpcAction,
  }
})
