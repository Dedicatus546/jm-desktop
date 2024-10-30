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
  <v-row>
    <v-col
      v-for="item of seriesList"
      :key="item.id"
      :cols="6"
      :sm="4"
      :md="3"
      :lg="2"
    >
      <!-- TODO migrate -->
      <router-link :to="{ name: 'HOME', params: { id: item.id } }" custom>
        <template #default="{ navigate }">
          <v-btn
            size="large"
            :color="currentSeriesId === item.id ? 'primary' : undefined"
            block
            @click="navigate()"
          >
            {{ item.name }}
          </v-btn>
        </template>
      </router-link>
    </v-col>
  </v-row>
</template>
