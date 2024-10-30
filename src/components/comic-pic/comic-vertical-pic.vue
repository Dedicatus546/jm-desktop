<script setup lang="ts">
import scrollIntoViewIfNeed from "scroll-into-view-if-needed";

import { decodeImage } from "@/utils/image-decode";

const props = defineProps<{
  src: string;
  comicId: number;
}>();
const emits = defineEmits<{
  (e: "intersect"): void;
}>();

const elRef = ref<HTMLDivElement | null>(null);
const isLoaded = ref(false);
const imgSrc = ref<string>("");

const onLoadImageIntersect = async (isIntersecting: boolean) => {
  if (isIntersecting) {
    imgSrc.value = await decodeImage(props.src, props.comicId);
  }
};

const onScrollImageIntersect = (isIntersecting: boolean) => {
  if (isIntersecting) {
    emits("intersect");
  }
};

defineExpose({
  scrollIntoView() {
    if (elRef.value) {
      scrollIntoViewIfNeed(elRef.value, {
        block: "start",
      });
    }
  },
});
</script>

<template>
  <div ref="elRef" class="relative" :class="{ 'aspect-[9/16]': !isLoaded }">
    <div
      v-intersect="{
        handler: onScrollImageIntersect,
        options: {
          rootMargin: '-50% 0% -50% 0%',
        },
      }"
      class="absolute inset-0"
    ></div>
    <img
      v-intersect.once="onLoadImageIntersect"
      class="block w-full h-full object-contain"
      :src="imgSrc"
      alt=""
      @load="isLoaded = true"
    />
  </div>
</template>

<style scoped></style>
