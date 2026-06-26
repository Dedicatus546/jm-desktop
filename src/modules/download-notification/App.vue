<script setup lang="ts">
import { useUrlSearchParams } from '@vueuse/core'
import { trpcClient } from '@/trpc'
import { useSyncPrefetchDataTrpc } from '@/compositions/use-sync-prefetch-data-trpc'
import { usePrefetchDataStore } from '@/stores/use-prefetch-data-store'

useSyncPrefetchDataTrpc()

const prefetchDataStore = usePrefetchDataStore()

const usp = useUrlSearchParams<{
  q: string
}>('history')

const msg = computed(() => {
  return JSON.parse(usp.q) as {
    comicId: string
  }
})

const cover = computed(() =>
  import.meta.env.VITE_NSFW === 'off'
    ? '/360x640.svg'
    : `${prefetchDataStore.state.imgHost}/media/albums/${msg.value.comicId}_3x4.jpg`,
)
</script>

<template>
  <app-provider>
    <v-app-bar density="compact" color="primary" class="app-region-drag">
      <v-app-bar-title style="font-size: 1.1rem">下载通知</v-app-bar-title>
      <template #append>
        <div class="app-region-nodrag">
          <v-btn size="small" flat icon @click="trpcClient.closeWindow.mutate()">
            <v-icon>
              <i-mdi-close />
            </v-icon>
          </v-btn>
        </div>
      </template>
    </v-app-bar>
    <v-main>
      <div
        class="wind-h-full wind-w-full wind-overflow-y-auto wind-p-4 wind-flex"
        style="height: calc(100vh - var(--v-layout-top, 0px))"
      >
        <div class="wind-w-[70px]">
          <v-img :aspect-ratio="3 / 4" alt="" :src="cover" />
        </div>
        <div class="wind-flex-grow">xxxxxxxxxxxx</div>
      </div>
    </v-main>
  </app-provider>
</template>

<style scoped lang="scss"></style>
