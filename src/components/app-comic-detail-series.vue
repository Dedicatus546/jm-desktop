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
  <v-row class="wind-p-1">
    <v-col
      v-for="item of seriesList"
      :key="item.id"
      :cols="6"
      :sm="4"
      :md="3"
      :lg="2"
    >
      <router-link :to="{ name: 'COMIC_READ', params: { id: item.id } }" custom>
        <template #default="{ navigate }">
          <v-btn
            class="chapter-btn"
            size="large"
            :color="currentSeriesId === item.id ? 'primary' : undefined"
            block
            @click="navigate()"
          >
            <app-scroll-wrapper>
              {{ item.name }}
            </app-scroll-wrapper>
          </v-btn>
        </template>
      </router-link>
    </v-col>
  </v-row>
</template>

<style scoped lang="scss">
.chapter-btn {
  ::v-deep(.v-btn__content) {
    min-width: 0;
  }
}
</style>
