<script setup lang="ts">
defineProps<{
  tooltipText: string
}>()

defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <v-tooltip :text="tooltipText" location="bottom">
    <template #activator="{ props }">
      <v-btn v-bind="props" icon @click="$emit('click')">
        <slot></slot>
      </v-btn>
    </template>
  </v-tooltip>
</template>
