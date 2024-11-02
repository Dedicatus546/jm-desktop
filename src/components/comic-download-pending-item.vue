<script setup lang="ts">
import useAppStore from "@/stores/use-app-store";

const props = defineProps<{
  comic: {
    id: number;
    name: string;
    author: string;
    total: number;
    loaded: number;
  };
}>();

const progress = computed(() =>
  props.comic.total === 0
    ? 0
    : +((props.comic.loaded / props.comic.total) * 100).toFixed(0),
);

const appStore = useAppStore();
</script>

<template>
  <v-card color="primary">
    <v-img
      cover
      class="block aspect-[3/4]"
      :alt="`${comic.name}的封面`"
      :src="`${appStore.setting.imgHost}/media/albums/${comic.id}_3x4.jpg`"
    />
    <v-card-item>
      <v-card-title>{{ comic.name }}</v-card-title>
      <v-card-subtitle>{{ comic.author ?? "未知作者" }}</v-card-subtitle>
    </v-card-item>
    <v-card-text>
      <v-progress-linear :model-value="progress"></v-progress-linear>
    </v-card-text>
  </v-card>
</template>

<style scoped></style>
