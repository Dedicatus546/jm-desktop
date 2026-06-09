<script setup lang="ts">
// import useInitApp from './compositions/use-init-app'
import { useRefreshUser } from '@/compositions/use-refresh-user'
import { useSyncConfigTrpc } from '@/compositions/use-sync-config-trpc'
import { useSyncPrefetchDataTrpc } from '@/compositions/use-sync-prefetch-data-trpc'
import { useSyncUserTrpc } from '@/compositions/use-sync-user-trpc'

// const { loading, error, currentStatus, init: reInit } = useInitApp()
useRefreshUser()
useSyncUserTrpc()
useSyncConfigTrpc()
useSyncPrefetchDataTrpc()
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
