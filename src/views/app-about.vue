<script setup lang="ts">
import { trpcClient } from '@/apis'

import { version } from '../../package.json'

const hash = __COMIT_HASH__
const isDev = import.meta.env.DEV
const repoUrl = import.meta.env.VITE_GIT_REPO_URL

const toRepo = () => {
  trpcClient.openLink.mutate({
    url: repoUrl,
  })
}
</script>

<template>
  <v-card title="关于">
    <v-card-text>
      <div
        class="wind-py-4 wind-flex wind-flex-col wind-gap-4 wind-items-center"
      >
        <v-avatar size="100" image="/png/512x512.png" rounded="0" />
        <div class="text-h5">jm-desktop</div>
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
            {{ isDev ? "DEV" : hash }}
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
    </v-card-text>
  </v-card>
</template>
