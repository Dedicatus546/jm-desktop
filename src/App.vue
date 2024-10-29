<script setup lang="ts">
import { notification, theme } from "ant-design-vue";
import { type ThemeConfig } from "ant-design-vue/es/config-provider/context";
import locale from "ant-design-vue/locale/zh_CN";
import { type ComponentPublicInstance } from "vue";

import useInitApp from "./compositions/use-init-app";
import { injectNotificationKey } from "./compositions/use-notification";
import useRecoveryScrollPosition from "./compositions/use-recovery-scroll-position";
import useAppStore from "./stores/use-app-store";

const appStore = useAppStore();
// 全局注册
// TODO fix 目前看来像是 ant-design-vue 的 bug
// https://github.com/vueComponent/ant-design-vue/issues/7875
const [api, ContextHolder] = notification.useNotification({
  top: "100px",
});
provide(injectNotificationKey, api);

const themeConfig = computed<ThemeConfig>(() => ({
  token: {
    colorPrimary: "#ff7a00",
    fontFamily: `'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`,
  },
  algorithm:
    appStore.config.mode === "light"
      ? theme.defaultAlgorithm
      : theme.darkAlgorithm,
}));

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
  <v-app>
    <div v-if="error"></div>
    <div
      v-if="loading || error"
      class="w-full h-full flex items-center justify-center"
    >
      <div v-if="loading" class="flex flex-col items-center gap-4">
        <!-- <a-spin size="large" /> -->
        {{ currentStatus }}
      </div>
      <div v-if="error" class="flex flex-col items-center gap-4">
        {{ error }}
        <v-btn type="primary" @click="reInit()">重新加载</v-btn>
      </div>
    </div>
    <template v-else>
      <app-header />
      <v-main>
        <div
          class="min-h-full mx-auto relative"
          :class="{
            'p-4': isAddContentPadding,
          }"
        >
          <router-view v-slot="{ Component }">
            <keep-alive include="app-home,app-search,app-person,app-category">
              route
            </keep-alive>
          </router-view>
        </div>
      </v-main>
    </template>
  </v-app>
</template>

<style scoped></style>
