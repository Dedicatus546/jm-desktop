<script setup lang="ts">
import useAppStore from "@/stores/use-app-store";
const app = useAppStore();
</script>

<template>
  <a-select v-model:value="app.config.currentShuntKey" class="w-[80px]">
    <a-select-option v-for="item of app.setting.shuntList" :key="item.key">
      {{ item.title }}
    </a-select-option>
  </a-select>
</template>
