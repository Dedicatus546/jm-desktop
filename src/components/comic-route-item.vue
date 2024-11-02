<script setup lang="ts">
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
</script>

<template>
  <router-link
    :to="{ name: 'COMIC_DETAIL', params: { id: comic.id }, replace }"
  >
    <comic-base-item :comic="comic"></comic-base-item>
  </router-link>
</template>

<style scoped></style>
