<script setup lang="ts">
import { type ThemeConfig } from "ant-design-vue/es/config-provider/context";
import locale from "ant-design-vue/locale/zh_CN";
import { type ComponentPublicInstance } from "vue";

import useInitApp from "./compositions/use-init-app";
import useRecoveryScrollPosition from "./compositions/use-recovery-scroll-position";

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
const scrollView = ref<ComponentPublicInstance | null>(null);
useRecoveryScrollPosition(scrollView);

const route = useRoute();
const isAddContentPadding = computed(() => {
  return !["COMIC_READ"].includes(route.name as string);
});
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
        <a-layout-content
          id="scroll-view"
          ref="scrollView"
          class="flex-grow overflow-auto"
        >
          <div
            class="min-h-full mx-auto relative"
            :class="{
              'p-4': isAddContentPadding,
            }"
          >
            <router-view v-slot="{ Component }">
              <keep-alive include="app-home,app-search,app-person">
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
