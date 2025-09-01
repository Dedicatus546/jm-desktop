<script setup lang="ts">
import { Swiper as SwiperInst } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/vue'

defineProps<{
  slidesPerView: number
  list: Array<{
    id: number
    name: string
    author: string
  }>
}>()

const swiperInst = ref<SwiperInst | null>(null)
const onSwiper = (swiper: SwiperInst) => {
  swiperInst.value = swiper
}

const prev = () => {
  swiperInst.value?.slidePrev()
}

const next = () => {
  swiperInst.value?.slideNext()
}
</script>

<template>
  <v-row>
    <v-col :cols="12">
      <swiper
        class="wind-select-none"
        centered-slides
        loop
        :slides-per-view="slidesPerView"
        :space-between="16"
        @swiper="onSwiper"
      >
        <swiper-slide v-for="item of list" :key="item.id">
          <app-comic-list-item :comic="item" />
        </swiper-slide>
      </swiper>
    </v-col>
    <v-col :cols="6">
      <v-btn color="primary" size="large" variant="flat" block @click="prev">
        <v-icon icon="mdi-chevron-left"></v-icon>
      </v-btn>
    </v-col>
    <v-col :cols="6">
      <v-btn color="primary" size="large" variant="flat" block @click="next">
        <v-icon icon="mdi-chevron-right"></v-icon>
      </v-btn>
    </v-col>
  </v-row>
</template>
