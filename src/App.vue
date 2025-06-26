<script setup lang="ts">
import useInitApp from "./compositions/use-init-app";
import useRefreshUser from "./compositions/use-refresh-user";

const { loading, error, currentStatus, init: reInit } = useInitApp();
// const scrollViewRef = ref<ComponentPublicInstance | null>(null);
// useRecoveryScrollPosition(scrollViewRef);
useRefreshUser();
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
              class="wind-h-full wind-w-full wind-relative wind-overflow-y-auto"
            >
              <div
                v-if="loading || error"
                class="wind-flex wind-h-full wind-w-full wind-items-center wind-justify-center"
              >
                <div
                  v-if="loading"
                  class="wind-flex wind-flex-col wind-gap-4 wind-items-center"
                >
                  <v-progress-circular indeterminate></v-progress-circular>
                  <span>{{ currentStatus }}</span>
                </div>
                <div
                  v-if="error"
                  class="wind-flex wind-flex-col wind-gap-4 wind-items-center"
                >
                  {{ error }}
                  <v-btn type="primary" @click="reInit()">重新加载</v-btn>
                </div>
              </div>
              <router-view v-else v-slot="{ Component }">
                <!-- <keep-alive
                  include="app-home,app-search,app-person,app-category"
                > -->
                <component :is="Component" />
                <!-- </keep-alive> -->
              </router-view>
            </v-container>
          </v-main>
        </app-snackbar-provider>
      </app-dialog-provider>
    </v-app>
  </v-defaults-provider>
</template>

<style scoped></style>
