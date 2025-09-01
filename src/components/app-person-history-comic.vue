<script setup lang="ts">
import { usePagination } from 'alova/client'

import { getHistoryComicListApi } from '@/apis'
import EMPTY_STATE_IMG from '@/assets/empty-state/6.jpg'

const { page, pageCount, pageSize, loading, data } = usePagination(
  page =>
    getHistoryComicListApi({
      page,
    }),
  {
    initialPage: 1,
    initialPageSize: 20,
    data: res => res.data.list,
    total: res => res.data.total,
  },
)
</script>

<template>
  <v-data-iterator :items="data" :items-per-page="pageSize" :loading="loading">
    <template #loader>
      <div
        class="wind-flex wind-h-[30vh] wind-items-center wind-justify-center"
      >
        <v-progress-circular indeterminate></v-progress-circular>
      </div>
    </template>
    <template #no-data>
      <v-empty-state
        title="一本都没看过，你是看封面就完事的吗"
        :image="EMPTY_STATE_IMG"
      ></v-empty-state>
    </template>
    <template #default="{ items }">
      <v-row>
        <template v-for="item of items" :key="item.raw.id">
          <v-col cols="6" :sm="4" :md="3" :lg="2">
            <app-comic-list-item :comic="item.raw" />
          </v-col>
        </template>
      </v-row>
    </template>
    <template #footer>
      <div class="wind-mt-4 wind-flex wind-justify-end">
        <v-pagination
          color="primary"
          v-model="page"
          :length="pageCount"
          :disabled="loading"
          :total-visible="8"
        ></v-pagination>
      </div>
    </template>
  </v-data-iterator>
</template>

<style scoped></style>
