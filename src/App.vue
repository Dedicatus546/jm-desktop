<script setup lang="ts">
import { type ComponentPublicInstance } from "vue";

import useInitApp from "./compositions/use-init-app";
import useRecoveryScrollPosition from "./compositions/use-recovery-scroll-position";
import useAppStore from "./stores/use-app-store";

const appStore = useAppStore();

const { loading, error, currentStatus, init: reInit } = useInitApp();
const scrollView = ref<ComponentPublicInstance | null>(null);
useRecoveryScrollPosition(scrollView);

const route = useRoute();
const isAddContentPadding = computed(() => {
  return !["COMIC_READ"].includes(route.name as string);
});
</script>

<template>
  <v-defaults-provider>
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
          <v-container
            fluid
            style="height: calc(100vh - var(--v-layout-top, 0px))"
            class="w-full h-full overflow-y-auto"
          >
            <router-view v-slot="{ Component }">
              <keep-alive include="app-home,app-search,app-person,app-category">
                <component :is="Component" />
              </keep-alive>
            </router-view>
          </v-container>
        </v-main>
      </template>
    </v-app>
  </v-defaults-provider>
</template>

<style scoped></style>
