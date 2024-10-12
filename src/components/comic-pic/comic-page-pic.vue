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
  <div ref="elRef" class="w-full h-full">
    <img
      v-if="visible"
      class="block w-full h-full object-contain"
      :src="imageSrc"
      alt=""
    />
    <a-flex v-else align="center" justify="center" class="w-full h-full">
      <a-spin size="large" />
    </a-flex>
  </div>
</template>

<style scoped></style>
