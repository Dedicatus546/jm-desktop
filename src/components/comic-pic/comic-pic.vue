<script setup lang="ts">
import { ComponentPublicInstance } from "vue";

import { decodeImage, needDecode } from "@/utils/image-rewrite";

import { type ComicPicElRef, decodeSrcMap, observer } from "./state";

const props = defineProps<{
  src: string;
  comicId: number;
}>();

const elRef = ref<HTMLDivElement | null>(null);
const visible = ref(false);
const imageSrc = ref("");

const onSetRef = (el: Element | ComponentPublicInstance | null) => {
  if (el) {
    const safeTypeEl = el as ComicPicElRef;
    safeTypeEl.__comic__pic__onVisible = async () => {
      observer.unobserve(safeTypeEl);
      if (!needDecode(props.comicId)) {
        visible.value = true;
        imageSrc.value = props.src;
        return;
      }
      const decodeSrc = await decodeImage(props.src, props.comicId);
      if (decodeSrc) {
        const key = props.src + props.comicId;
        decodeSrcMap.set(key, decodeSrc);
        setTimeout(
          () => {
            decodeSrcMap.delete(key);
          },
          10 * 60 * 1000,
        ); // 10 分钟过期
        imageSrc.value = decodeSrc;
        visible.value = true;
      }
    };
    elRef.value = safeTypeEl;
  } else {
    elRef.value = null;
  }
};

onMounted(() => {
  if (elRef.value) {
    observer.observe(elRef.value);
  }
});

onBeforeUnmount(() => {
  if (elRef.value) {
    observer.unobserve(elRef.value);
  }
});
</script>

<template>
  <div :ref="onSetRef">
    <img v-if="visible" class="block w-full" :src="imageSrc" alt="" />
    <div v-else class="aspect-[9/16] flex items-center justify-center">
      <a-spin size="large" />
    </div>
  </div>
</template>

<style scoped></style>
