<script setup lang="ts">
import { openPathIpc } from "@/apis";
import useAppStore from "@/stores/use-app-store";
import { resolveDownloadFileName } from "@/utils";

const props = defineProps<{
  comic: {
    id: number;
    name: string;
    author: string;
  };
}>();

const appStore = useAppStore();

const openLocalFile = () => {
  openPathIpc(
    appStore.config.downloadDir +
      "/" +
      resolveDownloadFileName(props.comic.id, props.comic.name),
  );
};
</script>

<template>
  <comic-base-item :comic="comic" @click="openLocalFile"></comic-base-item>
</template>

<style scoped></style>
