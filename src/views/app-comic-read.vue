<script setup lang="ts">
import { useRequest } from "alova/client";

import { getComicPicListApi } from "@/apis";
import useAppStore from "@/stores/use-app-store";
import { decodeImage } from "@/utils/image-decode";

const props = defineProps<{
  id: number;
}>();
const appStore = useAppStore();

const { loading, data, send } = useRequest(
  (id: number) => getComicPicListApi(id, appStore.config.currentShuntKey),
  {
    immediate: false,
    initialData: {
      list: [],
    },
  },
);

const cacheCount = 3;
const onDecodeSuccess = (index: number) => {
  const list = data.value.list ?? [];
  const start = Math.max(0, index - cacheCount);
  const end = Math.min(index + cacheCount, list.length - 1);
  for (let i = start; i <= end; i++) {
    // 缓存前后图片，这样翻页可以立马查看
    decodeImage(list[i], props.id);
  }
};
provide("onDecodeSuccess", onDecodeSuccess);

watchEffect(() => {
  send(props.id);
});
</script>

<template>
  <div
    v-if="loading"
    class="wind-flex wind-items-center wind-inset-0 wind-justify-center wind-absolute"
  >
    <v-progress-circular indeterminate></v-progress-circular>
  </div>
  <template v-else>
    <app-comic-scroll-read
      v-if="appStore.config.readMode === 'scroll'"
      :pic-list="data.list"
      :comic-id="id"
    />
    <app-comic-page-read v-else :pic-list="data.list" :comic-id="id" />
  </template>
</template>

<style scoped></style>
