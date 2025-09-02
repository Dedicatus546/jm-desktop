<script setup lang="ts">
import { useRouteQuery } from '@vueuse/router'
import { usePagination } from 'alova/client'

import { getCollectComicListApi } from '@/apis'
import EMPTY_STATE_IMG from '@/assets/empty-state/5.jpg'

const order = useRouteQuery<'mr' | 'mp'>('collectComicType', 'mr', {
  mode: 'push',
})

const routePage = useRouteQuery<string, number>('collectComicPage', '1', {
  transform: {
    get: val => Number.parseInt(val),
    // 这里必须转为 string ，不然和默认值不同会导致 page 为 1 时地址出现 page=1 ，进而影响路由历史
    set: val => String(val),
  },
  mode: 'push',
})
const { page, pageCount, pageSize, loading, data } = usePagination(
  page =>
    getCollectComicListApi({
      page,
      order: order.value,
    }),
  {
    initialPage: routePage.value,
    initialPageSize: 20,
    data: res => res.data.list,
    total: res => res.data.total,
    watchingStates: [order],
  },
)
syncRef(routePage, page)
</script>

<template>
  <v-data-iterator :items="data" :items-per-page="pageSize" :loading="loading">
    <template #loader>
      <v-row>
        <v-col :cols="6" :sm="4" :md="3" :lg="2" v-for="item of pageSize" :key="item">
          <app-comic-skeleten-list-item />
        </v-col>
      </v-row>
    </template>
    <template #header>
      <div class="mb-4 wind-flex wind-justify-end">
        <div class="wind-w-[200px]">
          <v-select
            color="primary"
            variant="outlined"
            v-model:model-value="order"
            hide-details
            :items="[
              {
                title: '收藏时间',
                value: 'mr',
              },
              {
                title: '更新时间',
                value: 'mp',
              },
            ]"
          ></v-select>
        </div>
      </div>
    </template>
    <template #no-data>
      <v-empty-state
        title="一个收藏都没点，看来是用完就忘了"
        :image="EMPTY_STATE_IMG"
      ></v-empty-state>
    </template>
    <template #default="{ items }">
      <v-row>
        <v-col v-for="item of items" :key="item.raw.id" :cols="6" :sm="4" :md="3" :lg="2">
          <app-comic-list-item :comic="item.raw" />
        </v-col>
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
