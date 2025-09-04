<script setup lang="ts">
import { breakpointsAntDesign } from '@vueuse/core'

import useUserStore from '@/stores/use-user-store'

const userStore = useUserStore()

const breakpoints = useBreakpoints(breakpointsAntDesign)
const isGreaterMd = breakpoints.greater('md')
const buttonCols = computed(() => {
  if (!userStore.userInfo) {
    return [12, 12, 12, 12]
  }
  if (isGreaterMd.value) {
    return [12, 12, 6, 6]
  }
  return [12, 12, 12, 12]
})
</script>

<template>
  <div class="wind-flex wind-gap-4">
    <div
      class="wind-flex-shrink-0 wind-max-w-[300px] wind-min-w-[200px] wind-w-1/4"
    >
      <v-card variant="text">
        <app-skeleten class="wind-aspect-ratio-[0.75]"></app-skeleten>
      </v-card>
    </div>
    <div
      class="wind-leading-6 wind-flex wind-flex-grow wind-flex-col wind-gap-4"
    >
      <div class="wind-flex wind-flex-col wind-gap-2">
        <app-skeleten class="text-h5 wind-w-1/2">&#12288;</app-skeleten>
        <div
          class="wind-flex wind-flex-wrap wind-gap-2"
        >
          <app-skeleten
            v-for="item of 3"
            :key="item"
            class="wind-h-[32px] wind-w-[60px]"
          >
            &#12288;
          </app-skeleten>
        </div>
      </div>
      <div>
        <v-row no-gutters class="wind-gap-2">
          <v-col :cols="12">
            <app-skeleten class="wind-h-[30px] wind-w-[180px]"></app-skeleten>
          </v-col>
          <v-col :cols="12">
            <app-skeleten class="wind-h-[30px] wind-w-[150px]"></app-skeleten>
          </v-col>
          <v-col :cols="12">
            <app-skeleten class="wind-h-[30px] wind-w-[160px]"></app-skeleten>
          </v-col>
        </v-row>
      </div>
      <div class="wind-mt-auto">
        <v-row>
          <v-col :cols="buttonCols[0]">
            <app-skeleten class="wind-h-[44px]">
              &#12288;
            </app-skeleten>
          </v-col>
          <v-col :cols="buttonCols[1]">
            <app-skeleten class="wind-h-[44px]">
              &#12288;
            </app-skeleten>
          </v-col>
          <template v-if="userStore.userInfo">
            <v-col :cols="buttonCols[2]">
              <app-skeleten class="wind-h-[44px]">
                &#12288;
              </app-skeleten>
            </v-col>
            <v-col :cols="buttonCols[3]">
              <app-skeleten class="wind-h-[44px]">
                &#12288;
              </app-skeleten>
            </v-col>
          </template>
        </v-row>
      </div>
    </div>
  </div>
</template>
