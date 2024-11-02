<script setup lang="ts">
defineProps<{
  title: string;
  image: string;
}>();
</script>

<template>
  <v-empty-state :title="title" :image="image"></v-empty-state>
</template>
