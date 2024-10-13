<script setup lang="ts">
defineProps<{
  seriesList: Array<{
    id: number;
    name: string;
  }>;
  currentSeriesId?: number;
}>();
</script>

<template>
  <a-row :gutter="[16, 16]">
    <a-col v-for="item of seriesList" :key="item.id" :sm="8" :xl="6" :xxl="4">
      <router-link :to="{ name: 'COMIC_READ', params: { id: item.id } }" custom>
        <template #default="{ navigate }">
          <a-button
            size="large"
            :type="currentSeriesId === item.id ? 'primary' : 'default'"
            block
            @click="navigate()"
          >
            {{ item.name }}
          </a-button>
        </template>
      </router-link>
    </a-col>
  </a-row>
</template>
