<script setup lang="ts">
import { breakpointsAntDesign } from "@vueuse/core";
import { useRequest } from "alova/client";
import { Pagination } from "swiper/modules";
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

const breakpoints = useBreakpoints(breakpointsAntDesign);
const isGreaterXXL = breakpoints.greater("xxl");
const isGreaterXL = breakpoints.greater("xl");
const isGreaterSM = breakpoints.greater("sm");
const slidesPerView = computed(() => {
  if (isGreaterXXL.value) {
    return 6;
  } else if (isGreaterXL.value) {
    return 5;
  } else if (isGreaterSM.value) {
    return 4;
  }
  return 3;
});
</script>

<template>
  <v-row v-if="loading || latestLoading">
    <v-col v-for="item of 4" :key="item" :cols="12">
      <v-card color="primary" variant="tonal">
        <v-card-title>
          <v-skeleton-loader type="heading"></v-skeleton-loader>
        </v-card-title>
        <v-container fluid>
          <v-row>
            <v-col v-for="subItem of 4" :key="subItem" :cols="3">
              <comic-item-skeleton />
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-col>
  </v-row>
  <v-row v-else>
    <v-col v-for="item of data.data" :key="item.id" :cols="24">
      <v-card :title="item.title" color="primary" variant="tonal">
        <v-container fluid>
          <swiper
            class="select-none"
            :slides-per-view="slidesPerView"
            :space-between="16"
            :modules="[Pagination]"
            :pagination="{
              clickable: true,
            }"
          >
            <swiper-slide v-for="subItem of item.list" :key="subItem.id">
              <comic-item :comic="subItem" />
            </swiper-slide>
          </swiper>
        </v-container>
      </v-card>
    </v-col>
    <v-col :cols="24">
      <v-card title="最新发布" color="primary" variant="tonal">
        <!-- TODO migrate -->
        <!-- <template #extra>
          <router-link custom :to="{ name: 'COMIC_LATEST' }">
            <template #default="{ navigate }">
              <v-btn @click="navigate()">更多</v-btn>
            </template>
          </router-link>
        </template> -->
        <v-container fluid>
          <v-row>
            <v-col
              v-for="item of latestData.data"
              :key="item.id"
              :cols="6"
              :sm="4"
              :md="3"
              :lg="2"
            >
              <comic-item :comic="item" />
            </v-col>
          </v-row>
        </v-container>
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
