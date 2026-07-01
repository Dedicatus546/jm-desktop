<script setup lang="ts">
// import useInitApp from './compositions/use-init-app'
import { useListenDownloadComplete } from '@/compositions/use-listen-download-complete'
import { useRefreshUser } from '@/compositions/use-refresh-user'
import { useSyncConfigTrpc } from '@/compositions/use-sync-config-trpc'
import { useSyncDownloadTrpc } from '@/compositions/use-sync-download-tprc'
import { useSyncPrefetchDataTrpc } from '@/compositions/use-sync-prefetch-data-trpc'
import { useSyncUserTrpc } from '@/compositions/use-sync-user-trpc'
import { useDownloadStore } from '@/stores/use-download-store'

// const { loading, error, currentStatus, init: reInit } = useInitApp()
useRefreshUser()
useSyncUserTrpc()
useSyncConfigTrpc()
useSyncPrefetchDataTrpc()
useSyncDownloadTrpc()
useListenDownloadComplete()

const downloadStore = useDownloadStore()
onMounted(() => {
  downloadStore.checkAndStartAction()
})
</script>

<template>
  <app-provider>
    <app-header />
    <v-main>
      <div id="scroll-view" class="wind-h-full wind-w-full wind-overflow-y-auto">
        <v-container
          fluid
          style="height: calc(100vh - var(--v-layout-top, 0px))"
          class="wind-h-full wind-w-full wind-relative"
        >
          <router-view></router-view>
        </v-container>
      </div>
    </v-main>
  </app-provider>
</template>

<style scoped></style>
