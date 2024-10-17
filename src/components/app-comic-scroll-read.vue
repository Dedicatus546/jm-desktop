<script setup lang="ts">
import { type ComicPicElRef } from "@/compositions/use-decode-image";

defineProps<{
  comicId: number;
  picList: Array<string>;
}>();

const sliderValue = ref(0);
const containerElRef = ref<HTMLDivElement | null>(null);
const observerRef = ref<IntersectionObserver | null>(null);
const comicVerticalPicListRef = ref<Array<{ scrollIntoView: () => void }>>([]);
provide("observerRef", observerRef);
const scrollObserverRef = ref<IntersectionObserver | null>(null);
provide("scrollObserverRef", scrollObserverRef);

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
  scrollObserverRef.value = new IntersectionObserver(
    (entries) => {
      entries.forEach((item) => {
        if (item.isIntersecting) {
          (item.target as any).__comic__pic__onScrollVisible?.();
        }
      });
    },
    {
      root: toValue(containerElRef),
      rootMargin: "-50% 0% -50% 0%",
    },
  );
});

onUnmounted(() => {
  observerRef.value?.disconnect();
  observerRef.value = null;
});

const onSliderAfterChange = (value: [number, number] | number) => {
  const index = (value as number) - 1;
  comicVerticalPicListRef.value?.[index].scrollIntoView();
};
</script>

<template>
  <div class="absolute inset-0">
    <div ref="containerElRef" class="absolute inset-0 p-4 overflow-auto">
      <template v-if="observerRef">
        <comic-vertical-pic
          v-for="(item, index) of picList"
          ref="comicVerticalPicListRef"
          :key="item"
          :comic-id="comicId"
          :src="item"
          @in-view="sliderValue = index + 1"
        />
      </template>
    </div>
    <div class="absolute bottom-4 inset-x-4">
      <a-card size="small">
        <a-flex align="center" :gap="16">
          <div class="flex-grow min-w-0">
            <a-slider
              v-model:value="sliderValue"
              :tooltip-open="false"
              :min="1"
              :max="picList.length"
              @after-change="onSliderAfterChange"
            />
          </div>
          <div class="flex-shrink-0">
            <app-shunt-select />
          </div>
          <div class="flex-shrink-0">
            {{ sliderValue }} / {{ picList.length }}
          </div>
        </a-flex>
      </a-card>
    </div>
  </div>
</template>
