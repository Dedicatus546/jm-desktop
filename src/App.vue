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

const getPopupContainer = (triggerNode?: HTMLElement) => {
  return (triggerNode?.parentNode as any) ?? document.body;
};
</script>

<template>
  <a-config-provider
    :theme="theme"
    :locale="locale"
    :get-popup-container="getPopupContainer"
  >
    <a-layout class="w-screen h-screen">
      <div v-if="error"></div>
      <a-flex
        v-if="loading || error"
        align="center"
        justify="center"
        class="w-full h-full"
      >
        <a-flex v-if="loading" vertical align="center" :gap="16">
          <a-spin size="large" />
          {{ currentStatus }}
        </a-flex>
        <a-flex v-if="error" vertical align="center" :gap="16">
          {{ error }}
          <a-button type="primary" @click="reInit()">重新加载</a-button>
        </a-flex>
      </a-flex>
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
