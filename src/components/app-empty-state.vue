<script setup lang="ts">
defineProps<{
  title: string;
  image: string;
}>();
</script>

<template>
  <!-- TODO empty image -->
  <v-empty-state :title="title" :image="image"></v-empty-state>
</template>
