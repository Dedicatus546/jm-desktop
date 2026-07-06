<script setup lang="ts">
import { useUrlSearchParams } from '@vueuse/core'
import { trpcClient } from '@/trpc'
import { AppNotification } from '@common/type'
import { decodeFromBase64 } from '@/utils/base64'

const usp = useUrlSearchParams<{
  q: string
}>('history')

const appNotificationInfo = computed(() => {
  return JSON.parse(decodeFromBase64(usp.q)) as AppNotification
})

onMounted(() => {
  setTimeout(() => {
    trpcClient.closeWindow.mutate()
  }, appNotificationInfo.value.duration)
})
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
        class="wind-h-full wind-w-full wind-overflow-y-auto wind-p-4"
        style="height: calc(100vh - var(--v-layout-top, 0px))"
      >
        <div
          class="wind-text-xl wind-font-bold wind-line-clamp-3"
          :title="appNotificationInfo.title"
        >
          {{ appNotificationInfo.title }}
        </div>
        <div class="wind-mt-2">{{ appNotificationInfo.body }}</div>
      </div>
    </v-main>
  </app-provider>
</template>

<style scoped lang="scss"></style>
