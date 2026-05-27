<script setup lang="ts">
// import useInitApp from './compositions/use-init-app'
import { useRefreshUser } from './compositions/use-refresh-user'
import { useSyncStoreTrpc } from './compositions/use-sync-store-tprc'

// const { loading, error, currentStatus, init: reInit } = useInitApp()
useRefreshUser()
useSyncStoreTrpc()
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
