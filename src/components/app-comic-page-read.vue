<script setup lang="ts">
import { ComicPicElRef } from "@/compositions/use-decode-image";

const props = defineProps<{
  comicId: number;
  picList: Array<string>;
}>();

const page = ref(0); // [0, picList.length - 1]
const sliderValue = ref(1); // [1, picList.length]

onActivated(() => {
  page.value = 0;
});

const hasLastPage = computed(() => page.value > 0);
const lastPage = () => {
  if (page.value === 0) {
    return;
  }
  page.value--;
  sliderValue.value = page.value + 1;
};

const hasNextPage = computed(() => page.value < props.picList.length - 1);
const nextPage = () => {
  if (page.value === props.picList.length - 1) {
    return;
  }
  page.value++;
  sliderValue.value = page.value + 1;
};

onKeyStroke("ArrowRight", () => nextPage(), {
  dedupe: true,
});
onKeyStroke("ArrowLeft", () => lastPage(), {
  dedupe: true,
});

const onSliderAfterChange = (value: [number, number] | number) => {
  page.value = (value as number) - 1;
};

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
  <div class="absolute inset-4">
    <a-flex vertical class="h-full" :gap="16">
      <div ref="containerElRef" class="flex-grow min-h-0">
        <template v-if="observerRef">
          <comic-page-pic
            :key="picList[page]"
            :comic-id="comicId"
            :src="picList[page]"
            :observer="observerRef"
          />
        </template>
      </div>
      <a-card class="flex-shrink-0" size="small">
        <a-flex align="center" :gap="16">
          <a-button
            type="primary"
            class="flex-shrink-0"
            shape="circle"
            block
            size="large"
            :disabled="!hasLastPage"
            @click="lastPage"
          >
            <template #icon>
              <CaretLeftOutlined />
            </template>
          </a-button>
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
            {{ sliderValue }} / {{ picList.length }}
          </div>
          <a-button
            type="primary"
            class="flex-shrink-0"
            shape="circle"
            block
            size="large"
            :disabled="!hasNextPage"
            @click="nextPage"
          >
            <template #icon>
              <CaretRightOutlined />
            </template>
          </a-button>
        </a-flex>
      </a-card>
    </a-flex>
  </div>
</template>
