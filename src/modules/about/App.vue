<script setup lang="ts">
import { trpcClient } from '@/trpc'

import { version } from '../../../package.json'
import { useSyncConfigTrpc } from '@/compositions/use-sync-config-trpc'

const hash = __COMIT_HASH__
const isDev = import.meta.env.DEV
const repoUrl = import.meta.env.VITE_GIT_REPO_URL

const toRepo = () => {
  trpcClient.openLink.mutate({
    url: repoUrl,
  })
}

useSyncConfigTrpc()
</script>

<template>
  <app-provider>
    <v-app-bar color="primary" class="app-region-drag">
      <v-app-bar-title>关于</v-app-bar-title>
      <template #append>
        <div class="app-region-nodrag">
          <v-btn flat icon @click="trpcClient.minimizeWindow.mutate()">
            <v-icon>
              <i-mdi-minus />
            </v-icon>
          </v-btn>
          <v-btn flat icon @click="trpcClient.closeWindow.mutate()">
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
        <div class="wind-py-4 wind-flex wind-flex-col wind-gap-4 wind-items-center">
          <v-avatar size="100" image="/png/512x512.png" :rounded="0" />
          <div class="wind-text-xl">jm-desktop</div>
        </div>
        <v-divider />
        <v-list>
          <v-list-item title="版本">
            <template #append>
              {{ version }}
            </template>
          </v-list-item>
          <v-list-item title="commit">
            <template #append>
              {{ isDev ? 'DEV' : hash }}
            </template>
          </v-list-item>
          <v-list-item title="仓库地址">
            <template #append>
              <div class="wind-cursor-pointer" @click="toRepo">
                {{ repoUrl }}
              </div>
            </template>
          </v-list-item>
        </v-list>
      </div>
    </v-main>
  </app-provider>
</template>
