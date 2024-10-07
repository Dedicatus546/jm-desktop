<script setup lang="ts">
import { useRequest } from "alova/client";

import { getComicPicListApi } from "@/apis";

const route = useRoute();
const id = computed(() => Number.parseInt(route.params.id as string));

const { loading, data } = useRequest(() => getComicPicListApi(id.value));
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
