<script setup lang="ts">
import useAppStore from "@/stores/use-app-store";

defineProps<{
  comic: {
    id: number;
    name: string;
    author: string;
  };
}>();

const appStore = useAppStore();
</script>

<template>
  <router-link :to="{ name: 'COMIC_DETAIL', params: { id: comic.id } }">
    <a-card>
      <template #cover>
        <img
          loading="lazy"
          class="block aspect-[3/4]"
          :alt="`${comic.name}的封面`"
          :src="`${appStore.setting.imgHost}/media/albums/${comic.id}_3x4.jpg`"
        />
      </template>
      <a-typography-title
        :level="5"
        class="break-all line-clamp-2 min-h-[48px]"
      >
        <a-tooltip :title="comic.name">{{ comic.name }}</a-tooltip>
      </a-typography-title>
      <a-typography-text class="break-all line-clamp-1">
        <a-tooltip v-if="comic.author">
          <template #title>
            {{ comic.author }}
          </template>
          {{ comic.author }}
        </a-tooltip>
        <template v-else>未知作者</template>
      </a-typography-text>
    </a-card>
  </router-link>
</template>

<style scoped></style>
