<script setup lang="ts">
import { breakpointsVuetifyV3 } from "@vueuse/core";
import { useRequest } from "alova/client";
import { Swiper, SwiperSlide } from "swiper/vue";

import { getLatestComicListApi, getPromoteComicListApi } from "@/apis";

const { loading, data } = useRequest(() => getPromoteComicListApi(), {
  initialData: {
    list: [],
  },
});
const { loading: latestLoading, data: latestData } = useRequest(() =>
  getLatestComicListApi(1),
);

const breakpoints = useBreakpoints(breakpointsVuetifyV3);
const isGreaterXXL = breakpoints.greater("xxl");
const isGreaterXL = breakpoints.greater("xl");
const isGreaterSM = breakpoints.greater("sm");
const slidesPerView = computed(() => {
  if (isGreaterXXL.value) {
    return 6.5;
  } else if (isGreaterXL.value) {
    return 5.5;
  } else if (isGreaterSM.value) {
    return 4.5;
  }
  return 3.5;
});
</script>

<template>
  <div
    v-if="loading || latestLoading"
    class="absolute inset-0 flex items-center justify-center"
  >
    <v-progress-circular indeterminate></v-progress-circular>
  </div>
  <v-row v-else>
    <v-col v-for="item of data.data" :key="item.id" :cols="24">
      <v-card :title="item.title">
        <v-card-text>
          <swiper
            class="select-none"
            :slides-per-view="slidesPerView"
            :space-between="16"
          >
            <swiper-slide v-for="subItem of item.list" :key="subItem.id">
              <comic-route-item :comic="subItem" />
            </swiper-slide>
          </swiper>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col :cols="24">
      <v-card>
        <v-card-item>
          <div class="flex items-center justify-between">
            <v-card-title>最新发布</v-card-title>
            <router-link custom :to="{ name: 'COMIC_LATEST' }">
              <template #default="{ navigate }">
                <v-btn variant="text" @click="navigate()">更多</v-btn>
              </template>
            </router-link>
          </div>
        </v-card-item>
        <v-card-text>
          <v-row>
            <v-col
              v-for="item of latestData.data"
              :key="item.id"
              :cols="6"
              :sm="4"
              :md="3"
              :lg="2"
            >
              <comic-route-item :comic="item" />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<style scoped lang="less">
.title-skeleton {
  :deep(.ant-skeleton-title) {
    margin-bottom: 0;
  }
}
</style>
