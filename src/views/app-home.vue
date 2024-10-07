<script setup lang="ts">
import { breakpointsAntDesign } from "@vueuse/core";
import { useRequest } from "alova/client";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/vue";

import { getPromoteComicListApi } from "@/apis";

const { loading, data } = useRequest(() => getPromoteComicListApi(), {
  initialData: {
    list: [],
  },
});
const breakpoints = useBreakpoints(breakpointsAntDesign);
const isGreaterXXL = breakpoints.greater("xxl");
const isGreaterXL = breakpoints.greater("xl");
const isGreaterSM = breakpoints.greater("sm");
const slidesPerView = computed(() => {
  if (isGreaterXXL.value) {
    return 8;
  } else if (isGreaterXL.value) {
    return 6;
  } else if (isGreaterSM.value) {
    return 4;
  }
  return 2;
});
</script>

<template>
  <a-row v-if="loading" :gutter="[16, 16]">
    <a-col v-for="item of 4" :key="item" :span="24">
      <a-card>
        <template #title>
          <a-skeleton
            class="title-skeleton"
            :paragraph="false"
            :title="{
              width: '30%',
            }"
          />
        </template>
        <a-row :gutter="[16, 16]">
          <a-col v-for="subItem of 4" :key="subItem" :span="6">
            <comic-item-skeleton />
          </a-col>
        </a-row>
      </a-card>
    </a-col>
  </a-row>
  <a-row v-else :gutter="[16, 16]">
    <a-col v-for="item of data.data" :key="item.id" :span="24">
      <a-card :title="item.title">
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
      </a-card>
    </a-col>
  </a-row>
</template>

<style scoped lang="less">
.title-skeleton {
  :deep(.ant-skeleton-title) {
    margin-bottom: 0;
  }
}
</style>
