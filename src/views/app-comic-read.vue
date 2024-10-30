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
  (id: number) => getComicPicListApi(id, appStore.config.currentShuntKey),
  {
    immediate: false,
    initialData: {
      list: [],
    },
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
  <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
    <v-progress-circular indeterminate></v-progress-circular>
  </div>
  <template v-else>
    <app-comic-scroll-read
      v-if="appStore.config.mode === 'light'"
      :pic-list="data.list"
      :comic-id="id"
    />
    <app-comic-page-read v-else :pic-list="data.list" :comic-id="id" />
  </template>
</template>

<style scoped></style>
