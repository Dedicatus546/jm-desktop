<script setup lang="ts">
import scrollIntoView from "scroll-into-view-if-needed";

import useDecodeImage from "@/compositions/use-decode-image";

const props = defineProps<{
  src: string;
  comicId: number;
}>();

const emits = defineEmits<{
  (e: "inView"): void;
}>();

const elRef = ref<HTMLDivElement | null>(null);
const radio = inject<Ref<number>>("imageRadio", ref(9 / 16));
const scrollObserverRef = inject<Ref<IntersectionObserver | null>>(
  "scrollObserverRef",
  ref(null),
);

const { imageSrc, visible } = useDecodeImage(
  elRef,
  toRef(props, "src"),
  toRef(props, "comicId"),
);

defineExpose({
  scrollIntoView() {
    if (elRef.value) {
      scrollIntoView(elRef.value, {
        block: "start",
      });
    }
  },
});

onMounted(() => {
  if (elRef.value) {
    (elRef.value as any).__comic__pic__onScrollVisible = () => {
      emits("inView");
    };
    scrollObserverRef.value?.observe(elRef.value);
  }
});

onBeforeUnmount(() => {
  if (elRef.value) {
    scrollObserverRef.value?.unobserve(elRef.value);
  }
});
</script>

<template>
  <div ref="elRef">
    <img v-if="visible" class="block w-full" :src="imageSrc" alt="" />
    <a-flex
      v-else
      align="center"
      justify="center"
      :style="{
        aspectRatio: radio,
      }"
    >
      <a-spin size="large" />
    </a-flex>
  </div>
</template>

<style scoped></style>
