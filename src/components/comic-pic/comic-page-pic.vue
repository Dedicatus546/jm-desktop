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
    class="w-full h-full object-contain"
    :class="{ 'aspect-[9/16]': !isLoaded }"
  >
    <img
      v-if="imgSrc"
      class="block w-full h-full object-contain"
      :src="imgSrc"
      alt=""
      @load="isLoaded = true"
    />
  </div>
</template>

<style scoped></style>
