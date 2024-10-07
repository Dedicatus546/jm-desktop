<script setup lang="ts">
import { type ThemeConfig } from "ant-design-vue/es/config-provider/context";
import locale from "ant-design-vue/locale/zh_CN";

import useInitApp from "./compositions/use-init-app";

const theme: ThemeConfig = {
  token: {
    fontFamily: `'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`,
  },
  components: {
    Layout: {
      colorBgHeader: "#ffffff99",
    },
  },
};

const { loading, error, currentStatus, init: reInit } = useInitApp();
</script>

<template>
  <a-config-provider :theme="theme" :locale="locale">
    <a-layout class="w-screen h-screen">
      <div v-if="error"></div>
      <div
        v-if="loading || error"
        class="w-full h-full flex items-center justify-center"
      >
        <div v-if="loading" class="flex flex-col items-center gap-4">
          <a-spin size="large" />
          {{ currentStatus }}
        </div>
        <div v-if="error" class="flex flex-col items-center gap-4">
          {{ error }}
          <a-button type="primary" @click="reInit()">重新加载</a-button>
        </div>
      </div>
      <template v-else>
        <app-header />
        <a-layout-content class="flex-grow overflow-auto">
          <div class="min-h-full mx-auto p-4 relative">
            <router-view v-slot="{ Component }">
              <keep-alive>
                <component :is="Component" />
              </keep-alive>
            </router-view>
          </div>
        </a-layout-content>
      </template>
    </a-layout>
  </a-config-provider>
</template>

<style scoped></style>
