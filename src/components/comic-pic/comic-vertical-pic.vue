<script setup lang="ts">
import scrollIntoViewIfNeed from "scroll-into-view-if-needed";

import { decodeImage } from "@/utils/image-decode";

const props = defineProps<{
  src: string;
  comicId: number;
}>();
const emits = defineEmits<{
  (e: "intersect"): void;
  (e: "decodeSuccess"): void;
}>();

const elRef = ref<HTMLDivElement | null>(null);
const isLoaded = ref(false);
const imgSrc = ref<string>("");

const onLoadImageIntersect = async (isIntersecting: boolean) => {
  if (isIntersecting) {
    imgSrc.value = await decodeImage(props.src, props.comicId);
    emits("decodeSuccess");
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
  <div
    ref="elRef"
    class="wind-relative"
    :class="{ 'wind-aspect-[9/16]': !isLoaded }"
  >
    <div
      v-intersect="{
        handler: onScrollImageIntersect,
        options: {
          rootMargin: '-50% 0% -50% 0%',
        },
      }"
      class="wind-inset-0 wind-absolute"
    ></div>
    <div
      v-intersect.once="onLoadImageIntersect"
      class="wind-inset-0 wind-absolute"
    ></div>
    <img
      v-if="imgSrc"
      class="wind-h-full wind-w-full wind-block wind-object-contain"
      :src="imgSrc"
      :data-original-src="src"
      alt=""
      @load="isLoaded = true"
    />
  </div>
</template>

<style scoped></style>
