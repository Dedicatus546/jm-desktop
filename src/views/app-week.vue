<script setup lang="ts">
import { useRouteQuery } from '@vueuse/router'
import { usePagination } from 'alova/client'

import { getWeekComicListApi } from '@/apis'
import EMPTY_STATE_IMG from '@/assets/empty-state/2.jpg'
import useAppStore from '@/stores/use-app-store'

const appStore = useAppStore()

const category = useRouteQuery<string, number>('category', appStore.data.weekCategoryList[0].id + '', {
  mode: 'push',
  transform: {
    get: v => Number.parseInt(v),
    set: v => String(v),
  },
})
const type = useRouteQuery('type', appStore.data.weekTypeList.at(-1)!.id, {
  mode: 'push',
})

const {
  // page,
  // total,
  pageSize,
  data: list,
  loading,
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
    initialPage: 1,
    initialPageSize: 20,
    data: res => res.data.list,
    total: res => res.data.total,
    watchingStates: [category, type],
  },
)
</script>

<template>
  <v-card>
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
                    :items="appStore.data.weekCategoryList"
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
                    :items="appStore.data.weekTypeList"
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
