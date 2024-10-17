<script setup lang="ts">
import { useRequest } from "alova/client";

import { getComicPicListApi } from "@/apis";
import useAppStore from "@/stores/use-app-store";

const props = defineProps<{
  id: number;
}>();
const radio = ref<number>(0);
const appStore = useAppStore();

const { loading, data, send, onSuccess } = useRequest(
  (id: number) => getComicPicListApi(id, appStore.setting.currentShuntKey),
  {
    immediate: false,
  },
);

provide("imageRadio", radio);
onSuccess(() => {
  radio.value = data.value.radio;
});

watchEffect(() => {
  send(props.id);
});
</script>

<template>
  <a-flex
    v-if="loading || !data"
    align="center"
    justify="center"
    class="absolute inset-4"
  >
    <a-spin size="large" spinning></a-spin>
  </a-flex>
  <template v-else>
    <app-comic-scroll-read
      v-if="appStore.config.readMode === 1"
      :pic-list="data.list"
      :comic-id="id"
    />
    <app-comic-page-read v-else :pic-list="data.list" :comic-id="id" />
  </template>
</template>

<style scoped></style>
