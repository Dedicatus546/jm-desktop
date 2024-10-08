<script setup lang="ts">
import useDecodeImage from "@/compositions/use-decode-image";

const props = defineProps<{
  src: string;
  comicId: number;
}>();

const { onSetRef, imageSrc, visible } = useDecodeImage(
  toRef(props, "src"),
  toRef(props, "comicId"),
);
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
