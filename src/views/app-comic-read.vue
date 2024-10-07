<script setup lang="ts">
import { useRequest } from "alova/client";

import { getComicPicListApi } from "@/apis";

const props = defineProps<{
  id: number;
}>();

const { loading, data, send } = useRequest(
  (id: number) => getComicPicListApi(id),
  {
    immediate: false,
  },
);

watchEffect(() => {
  send(props.id);
});
</script>

<template>
  <div v-if="loading" class="aspect-[9/16] flex items-center justify-center">
    <a-spin size="large" spinning></a-spin>
  </div>
  <div v-else>
    <comic-pic v-for="item of data" :key="item" :comic-id="id" :src="item" />
  </div>
</template>

<style scoped></style>
