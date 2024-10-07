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
const slidesPerView = computed(() => {
  if (breakpoints.greater("xxl").value) {
    return 8;
  } else if (breakpoints.greater("xl").value) {
    return 6;
  } else if (breakpoints.greater("sm").value) {
    return 4;
  }
  return 2;
});
</script>

<template>
  <a-spin :spinning="loading">
    <a-row :gutter="[16, 16]">
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
  </a-spin>
</template>

<style scoped></style>
