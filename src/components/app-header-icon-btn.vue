<script setup lang="ts">
defineProps<{
  tooltipText: string
  icon: string
}>()

defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <v-tooltip :text="tooltipText" location="bottom">
    <template #activator="{ props }">
      <v-btn v-bind="props" :icon="icon" @click="$emit('click')"></v-btn>
    </template>
  </v-tooltip>
</template>
