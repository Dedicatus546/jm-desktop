<script setup lang="ts">
import { openLinkIpc } from "@/apis";
import { version } from "@@/package.json";
const hash = __COMIT_HASH__;
const isDev = import.meta.env.DEV;

const toRepo = () => {
  openLinkIpc("https://github.com/Dedicatus546/jm-desktop");
};
</script>

<template>
  <v-card title="关于">
    <v-card-text>
      <div class="wind-flex wind-flex-col wind-gap-4 wind-items-center wind-py-4">
        <v-avatar size="100" image="/png/512x512.png" rounded="0" />
        <div class="wind-text-h5">jm-desktop</div>
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
              https://github.com/Dedicatus546/jm-desktop
            </div>
          </template>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>
