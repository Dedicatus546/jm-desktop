<script setup lang="ts">
import { useRouteQuery } from '@vueuse/router'
import { usePagination, useRequest } from 'alova/client'

import { getWeekComicListApi, getWeekListApi } from '@/apis'
import EMPTY_STATE_IMG from '@/assets/empty-state/2.jpg'

const category = useRouteQuery('category', '', {
  mode: 'push',
  transform: {
    get: v => (!v ? -1 : Number.parseInt(v)),
  },
})
const type = useRouteQuery('type', 'manga', {
  mode: 'push',
})

const {
  data,
  onSuccess,
  loading: weekLoading,
} = useRequest(() => getWeekListApi())

const {
  // page,
  // total,
  pageSize,
  data: list,
  loading,
  send,
} = usePagination(
  page =>
    getWeekComicListApi({
      page,
      category: category.value,
      type: type.value,
    }),
  {
    // 一般只有一页
    preloadNextPage: false,
    immediate: false,
    initialPage: 1,
    initialPageSize: 20,
    data: res => res.data.list,
    total: res => res.data.total,
    watchingStates: [category, type],
  },
)

onSuccess(() => {
  if (data.value.data.categoryList.length > 0 && category.value === -1) {
    category.value = data.value.data.categoryList[0].id
  }
  else {
    send(1, 20)
  }
  // if (data.value.data.typeList.length > 0) {
  //   formState.type = data.value.data.typeList[0].id;
  // }
  // send(1, 80);
})
</script>

<template>
  <div
    v-if="weekLoading"
    class="wind-flex wind-items-center wind-inset-0 wind-justify-center wind-absolute"
  >
    <v-progress-circular indeterminate></v-progress-circular>
  </div>
  <v-card v-else>
    <v-card-text>
      <v-row>
        <v-col :cols="12">
          <v-data-iterator
            :items-per-page="pageSize"
            :items="list ?? []"
            :loading="loading"
          >
            <template #loader>
              <v-row>
                <v-col :cols="6" :sm="4" :md="3" :lg="2" v-for="item of pageSize" :key="item">
                  <app-comic-skeleten-list-item />
                </v-col>
              </v-row>
            </template>
            <template #header>
              <v-row>
                <v-col :cols="6">
                  <v-select
                    color="primary"
                    variant="outlined"
                    v-model:model-value="category"
                    hide-details
                    item-title="name"
                    item-value="id"
                    :items="data?.data.categoryList ?? []"
                  ></v-select>
                </v-col>
                <v-col :cols="6">
                  <v-select
                    color="primary"
                    variant="outlined"
                    v-model:model-value="type"
                    hide-details
                    item-title="name"
                    item-value="id"
                    :items="data?.data.typeList ?? []"
                  ></v-select>
                </v-col>
              </v-row>
              <div class="wind-h-4"></div>
            </template>
            <template #no-data>
              <v-empty-state
                title="出现这个就大概率是出 BUG 了，请提 issue"
                :image="EMPTY_STATE_IMG"
              ></v-empty-state>
            </template>
            <template #default="{ items }">
              <v-row>
                <template v-for="item of items" :key="item.raw.id">
                  <v-col :cols="6" :sm="4" :md="3" :lg="2">
                    <app-comic-list-item :comic="item.raw" />
                  </v-col>
                </template>
              </v-row>
            </template>
          </v-data-iterator>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
