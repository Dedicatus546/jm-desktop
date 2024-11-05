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
const route = useRoute();
</script>

<template>
  <v-card color="primary">
    <v-img
      :aspect-ratio="3 / 4"
      class="block aspect-[3/4]"
      :alt="`${comic.name}的封面`"
      :src="`${appStore.setting.imgHost}/media/albums/${comic.id}_3x4.jpg`"
    />
    <v-card-item>
      <v-card-title>{{ comic.name }}</v-card-title>
      <v-card-subtitle
        :class="{
          'cursor-pointer': !!comic.author,
        }"
      >
        <router-link
          v-if="comic.author && route.name !== 'QUICK_SEARCH'"
          :to="{
            name: 'QUICK_SEARCH',
            query: { query: comic.author },
            replace: route.name === 'QUICK_SEARCH',
          }"
        >
          {{ comic.author }}
        </router-link>
        <template v-else>未知作者</template>
      </v-card-subtitle>
    </v-card-item>
  </v-card>
</template>

<style scoped></style>
