<script setup lang="ts">
const visibleRef = useTemplateRef('visibleRef')
const isVisible = useElementVisibility(visibleRef, {
  once: true,
  rootMargin: '100px 0px 100px 0px',
  scrollTarget() {
    return document.getElementById('scroll-view')
  },
})
const isInside = ref(false)
watch(isVisible, (nVal, oVal) => {
  if (oVal || nVal) {
    isInside.value = true
  }
},
{
  immediate: true,
})
</script>

<template>
  <div class="wind-relative">
    <v-card color="primary" v-if="isInside">
      <app-skeleten class="wind-aspect-ratio-[0.75]"></app-skeleten>
      <v-card-item class="wind-pb-[.425rem]! wind-pt-[.425rem]!">
        <v-card-title class="wind-mb-[.4rem]">
          <app-skeleten>&#12288;</app-skeleten>
        </v-card-title>
        <v-card-subtitle>
          <app-skeleten>&#12288;</app-skeleten>
        </v-card-subtitle>
      </v-card-item>
    </v-card>
    <div class="wind-aspect-ratio-[0.57978]" v-else></div>
    <div class="wind-pointer-events-none wind-inset-0 wind-absolute" ref="visibleRef"></div>
  </div>
</template>

<style scoped></style>
