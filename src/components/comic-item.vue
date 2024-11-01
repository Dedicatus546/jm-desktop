<script setup lang="ts">
import useAppStore from "@/stores/use-app-store";

withDefaults(
  defineProps<{
    comic: {
      id: number;
      name: string;
      author: string;
    };
    replace?: boolean;
  }>(),
  {
    replace: false,
  },
);

const appStore = useAppStore();
</script>

<template>
  <router-link
    :to="{ name: 'COMIC_DETAIL', params: { id: comic.id }, replace }"
  >
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
    </v-card>
  </router-link>
</template>

<style scoped></style>
