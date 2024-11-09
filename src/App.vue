<script setup lang="ts">
import { ComponentPublicInstance } from "vue";

import useInitApp from "./compositions/use-init-app";
import useRecoveryScrollPosition from "./compositions/use-recovery-scroll-position";

const { loading, error, currentStatus, init: reInit } = useInitApp();
const scrollViewRef = ref<ComponentPublicInstance | null>(null);
useRecoveryScrollPosition(scrollViewRef);
</script>

<template>
  <v-defaults-provider>
    <v-app>
      <app-dialog-provider>
        <app-snackbar-provider location="top right">
          <app-header :simple="!!(loading || error)" />
          <v-main>
            <v-container
              id="scroll-view"
              ref="scrollViewRef"
              fluid
              style="height: calc(100vh - var(--v-layout-top, 0px))"
              class="w-full h-full overflow-y-auto relative"
            >
              <div
                v-if="loading || error"
                class="w-full h-full flex items-center justify-center"
              >
                <div v-if="loading" class="flex flex-col items-center gap-4">
                  <v-progress-circular indeterminate></v-progress-circular>
                  <span>{{ currentStatus }}</span>
                </div>
                <div v-if="error" class="flex flex-col items-center gap-4">
                  {{ error }}
                  <v-btn type="primary" @click="reInit()">重新加载</v-btn>
                </div>
              </div>
              <router-view v-else v-slot="{ Component }">
                <keep-alive
                  include="app-home,app-search,app-person,app-category"
                >
                  <component :is="Component" />
                </keep-alive>
              </router-view>
            </v-container>
          </v-main>
        </app-snackbar-provider>
      </app-dialog-provider>
    </v-app>
  </v-defaults-provider>
</template>

<style scoped></style>
