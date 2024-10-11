<script setup lang="ts">
import useDecodeImage from "@/compositions/use-decode-image";

const props = defineProps<{
  src: string;
  comicId: number;
  observer: IntersectionObserver | null;
}>();

const elRef = ref<HTMLDivElement | null>(null);

const { imageSrc, visible } = useDecodeImage(
  elRef,
  props.observer,
  toRef(props, "src"),
  toRef(props, "comicId"),
);
</script>

<template>
  <div ref="elRef" class="w-full h-full">
    <img
      v-if="visible"
      class="block w-full h-full object-contain"
      :src="imageSrc"
      alt=""
    />
    <div v-else class="w-full h-full flex items-center justify-center">
      <a-spin size="large" />
    </div>
  </div>
</template>

<style scoped></style>
