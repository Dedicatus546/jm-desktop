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
const route = useRoute();
</script>

<template>
  <router-link
    :to="{ name: 'COMIC_DETAIL', params: { id: comic.id }, replace }"
  >
    <v-card color="primary">
      <v-img
        :aspect-ratio="3 / 4"
        cover
        :alt="`${comic.name}的封面`"
        :src="`${appStore.setting.imgHost}/media/albums/${comic.id}_3x4.jpg`"
      />
      <v-card-item>
        <v-card-title>{{ comic.name }}</v-card-title>
        <v-card-subtitle class="wind-cursor-default">
          <app-scroll-wrapper
            v-if="comic.author && route.name !== 'QUICK_SEARCH'"
          >
            <router-link
              :to="{
                name: 'QUICK_SEARCH',
                query: { query: comic.author },
                replace: route.name === 'QUICK_SEARCH',
              }"
            >
              {{ comic.author }}
            </router-link>
          </app-scroll-wrapper>
          <template v-else>未知作者</template>
        </v-card-subtitle>
      </v-card-item>
    </v-card>
  </router-link>
</template>

<style scoped></style>
