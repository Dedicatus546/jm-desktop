<script setup lang="ts">
import { showItemInFolder } from "@/apis";
import useAppStore from "@/stores/use-app-store";

const props = defineProps<{
  comic: {
    id: number;
    belongId: number;
    name: string;
    author: string;
    fileName: string;
    seriesName: string;
  };
}>();

const appStore = useAppStore();

const openLocalFile = () => {
  showItemInFolder(appStore.config.downloadDir + "/" + props.comic.fileName);
};
</script>

<template>
  <v-card color="primary" class="wind-cursor-pointer" @click="openLocalFile">
    <v-img
      :aspect-ratio="3 / 4"
      :alt="`${comic.name}的封面`"
      :src="`${appStore.setting.imgHost}/media/albums/${comic.belongId}_3x4.jpg`"
    >
      <div
        v-if="comic.id !== comic.belongId"
        class="wind-absolute wind-right-4 wind-top-4"
      >
        <v-chip variant="elevated" elevation="0" color="primary">
          {{ comic.seriesName }}
        </v-chip>
      </div>
    </v-img>
    <v-card-item>
      <v-card-title>{{ comic.name }}</v-card-title>
      <v-card-subtitle>
        <template v-if="comic.author">
          {{ comic.author }}
        </template>
        <template v-else>未知作者</template>
      </v-card-subtitle>
    </v-card-item>
  </v-card>
</template>

<style scoped></style>
