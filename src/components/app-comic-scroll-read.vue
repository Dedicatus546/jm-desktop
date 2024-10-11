<script setup lang="ts">
import { type ComicPicElRef } from "@/compositions/use-decode-image";

defineProps<{
  comicId: number;
  picList: Array<string>;
}>();

const sliderValue = ref(0);
const containerElRef = ref<HTMLDivElement | null>(null);
const observerRef = ref<IntersectionObserver | null>(null);

onMounted(() => {
  observerRef.value = new IntersectionObserver(
    (entries) => {
      entries.forEach((item) => {
        if (item.isIntersecting) {
          // show
          (item.target as ComicPicElRef).__comic__pic__onVisible?.();
        }
      });
    },
    {
      root: toValue(containerElRef),
    },
  );
});
</script>

<template>
  <div class="absolute inset-0">
    <div ref="containerElRef" class="absolute inset-0 p-4 overflow-auto">
      <template v-if="observerRef">
        <comic-vertical-pic
          v-for="item of picList"
          :key="item"
          :comic-id="comicId"
          :src="item"
          :observer="observerRef"
        />
      </template>
    </div>
    <!-- TODO -->
    <div class="absolute bottom-4 inset-x-4">
      <a-card size="small">
        <a-slider
          v-model:value="sliderValue"
          :tooltip-open="false"
          :min="1"
          :max="picList.length"
        />
      </a-card>
    </div>
  </div>
</template>
