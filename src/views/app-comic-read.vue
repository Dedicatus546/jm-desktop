<script setup lang="ts">
import { useRequest } from 'alova/client'

import { getComicPicListApi } from '@/apis'
import { decodeImage } from '@/utils/image-decode'
import { useConfigStore } from '@/stores/use-config-store'

const props = defineProps<{
  id: number
}>()
const configStore = useConfigStore()

const { loading, data, send, error } = useRequest(
  (id: number) => getComicPicListApi(id, configStore.state.currentShuntKey ?? 1),
  {
    immediate: false,
    initialData: {
      list: [],
      scrambleId: 0,
      speed: '',
    },
  },
)

const cacheCount = 3
const onDecodeSuccess = (index: number) => {
  const list = data.value.list ?? []
  const start = Math.max(0, index - cacheCount)
  const end = Math.min(index + cacheCount, list.length - 1)
  for (let i = start; i <= end; i++) {
    // 缓存前后图片，这样翻页可以立马查看
    decodeImage(list[i], props.id, data.value.scrambleId, data.value.speed)
  }
}
provide('onDecodeSuccess', onDecodeSuccess)

watchEffect(() => {
  send(props.id)
})

const retry = () => {
  error.value = undefined
  send(props.id)
}
</script>

<template>
  <div
    v-if="loading"
    class="wind-flex wind-items-center wind-inset-0 wind-justify-center wind-absolute"
  >
    <v-progress-circular indeterminate></v-progress-circular>
  </div>
  <app-error :error="error" v-else-if="error" @retry="retry" />
  <template v-else>
    <app-comic-scroll-read
      v-if="configStore.state.readMode === 'scroll'"
      :pic-list="data.list"
      :comic-id="id"
      :scramble-id="data.scrambleId"
      :speed="data.speed"
    />
    <app-comic-page-read
      v-else
      :pic-list="data.list"
      :comic-id="id"
      :scramble-id="data.scrambleId"
      :speed="data.speed"
    />
  </template>
</template>

<style scoped></style>
