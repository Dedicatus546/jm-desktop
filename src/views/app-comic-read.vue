<script setup lang="ts">
import { useRequest } from "alova/client";

import { getComicPicListApi } from "@/apis";
import useAppStore from "@/stores/use-app-store";

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

const appStore = useAppStore();
</script>

<template>
  <div
    v-if="loading || !data"
    class="absolute inset-4 flex items-center justify-center"
  >
    <a-spin size="large" spinning></a-spin>
  </div>
  <template v-else>
    <div v-if="appStore.config.readMode === 1">
      <comic-vertical-pic
        v-for="item of data"
        :key="item"
        :comic-id="id"
        :src="item"
      />
    </div>
    <app-comic-page-read v-else :pic-list="data" :comic-id="id" />
  </template>
</template>

<style scoped></style>
