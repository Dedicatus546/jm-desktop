<script setup lang="ts">
import useDecodeImage from "@/compositions/use-decode-image";

const props = defineProps<{
  src: string;
  comicId: number;
}>();

const elRef = ref<HTMLDivElement | null>(null);

const { imageSrc, visible } = useDecodeImage(
  elRef,
  toRef(props, "src"),
  toRef(props, "comicId"),
);
</script>

<template>
  <div ref="elRef">
    <img v-if="visible" class="block w-full" :src="imageSrc" alt="" />
    <div v-else class="aspect-[9/16] flex items-center justify-center">
      <a-spin size="large" />
    </div>
  </div>
</template>

<style scoped></style>
