<script setup lang="ts">
import { decodeImage } from "@/utils/image-decode";

const props = defineProps<{
  src: string;
  comicId: number;
}>();
const emits = defineEmits<{
  (e: "decodeSuccess"): void;
}>();

const isLoaded = ref(false);
const imgSrc = ref<string>("");

onMounted(async () => {
  imgSrc.value = await decodeImage(props.src, props.comicId);
  emits("decodeSuccess");
});
</script>

<template>
  <div
    class="wind-w-full wind-h-full wind-object-contain"
    :class="{ 'wind-aspect-[9/16]': !isLoaded }"
  >
    <img
      v-if="imgSrc"
      class="wind-block wind-w-full wind-h-full wind-object-contain"
      :src="imgSrc"
      :data-original-src="src"
      alt=""
      @load="isLoaded = true"
    />
  </div>
</template>

<style scoped></style>
