<script setup lang="ts">
import useInitApp from './compositions/use-init-app'
import useRefreshUser from './compositions/use-refresh-user'

const { loading, error, currentStatus, init: reInit } = useInitApp()
useRefreshUser()
</script>

<template>
  <v-defaults-provider>
    <v-app>
      <app-dialog-provider>
        <app-snackbar-provider location="top right" :timeout="1500">
          <app-header :simple="!!(loading || error)" />
          <v-main>
            <div id="scroll-view" class="wind-h-full wind-w-full wind-overflow-y-auto">
              <v-container
                fluid
                style="height: calc(100vh - var(--v-layout-top, 0px))"
                class="wind-h-full wind-w-full wind-relative"
              >
                <div
                  v-if="loading"
                  class="wind-flex wind-flex-col wind-gap-4 wind-h-full wind-w-full wind-items-center wind-justify-center"
                >
                  <v-progress-circular indeterminate></v-progress-circular>
                  <span>{{ currentStatus }}</span>
                </div>
                <div
                  v-else-if="error"
                  class="wind-flex wind-flex-col wind-gap-4 wind-h-full wind-w-full wind-items-center wind-justify-center"
                >
                  <span>{{ error }}</span>
                  <v-btn type="primary" @click="reInit()">重新加载</v-btn>
                </div>
                <router-view v-else></router-view>
              </v-container>
            </div>
          </v-main>
          <app-download-notice />
        </app-snackbar-provider>
      </app-dialog-provider>
    </v-app>
  </v-defaults-provider>
</template>

<style scoped></style>
