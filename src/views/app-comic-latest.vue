<script setup lang="ts">
import { usePagination } from 'alova/client'

import { getLatestComicListApi } from '@/apis'
import EMPTY_STATE_IMG from '@/assets/empty-state/2.jpg'

const { loading, data, page, pageSize } = usePagination(
  page => getLatestComicListApi(page),
  {
    append: true,
    initialPage: 1,
    initialPageSize: 80,
    data: res => res.data,
    total: () => 0,
    initialData: {
      data: [],
    },
  },
)
</script>

<template>
  <v-card title="最新发布">
    <v-card-text>
      <v-data-iterator
        :items="data"
        :items-per-page="data.length"
        :loading="loading"
      >
        <template #loader>
          <v-row>
            <v-col :cols="6" :sm="4" :md="3" :lg="2" v-for="item of pageSize" :key="item">
              <app-comic-skeleten-list-item />
            </v-col>
          </v-row>
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
              <v-col cols="6" :sm="4" :md="3" :lg="2">
                <app-comic-list-item :comic="item.raw" />
              </v-col>
            </template>
          </v-row>
        </template>
        <template #footer>
          <v-btn
            v-if="data.length > 0"
            :loading="loading"
            block
            color="primary"
            class="wind-mt-4"
            size="large"
            @click="page++"
          >
            查看更多
          </v-btn>
        </template>
      </v-data-iterator>
    </v-card-text>
  </v-card>
</template>
