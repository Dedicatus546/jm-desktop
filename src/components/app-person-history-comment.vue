<script setup lang="ts">
import { useRouteQuery } from '@vueuse/router'
import { usePagination } from 'alova/client'

import { getUserCommentListApi } from '@/apis'
import EMPTY_STATE_IMG from '@/assets/empty-state/1.jpg'
import useUserStore from '@/stores/use-user-store'

const routePage = useRouteQuery<string, number>('historyCommentPage', '1', {
  transform: {
    get: val => Number.parseInt(val),
    // 这里必须转为 string ，不然和默认值不同会导致 page 为 1 时地址出现 page=1 ，进而影响路由历史
    set: val => String(val),
  },
  mode: 'push',
})
const userStore = useUserStore()
const { page, pageCount, pageSize, loading, data } = usePagination(
  page => getUserCommentListApi(page, userStore.userInfo!.uid),
  {
    initialPage: 1,
    initialPageSize: 10,
    data: res => res.data.list,
    total: res => res.data.total,
  },
)
syncRef(routePage, page)
</script>

<template>
  <v-data-iterator :items="data" :items-per-page="pageSize" :loading="loading">
    <template #loader>
      <v-row>
        <template v-for="item of pageSize" :key="item">
          <v-col cols="12">
            <app-comment-skeleten-list-item />
          </v-col>
          <v-col>
            <v-divider />
          </v-col>
        </template>
      </v-row>
    </template>
    <template #no-data>
      <v-empty-state
        title="看来不是很喜欢评论"
        :image="EMPTY_STATE_IMG"
      ></v-empty-state>
    </template>
    <template #default="{ items }">
      <v-row>
        <template v-for="item of items" :key="item.raw.id">
          <v-col cols="12">
            <app-comment-list-item :comment="item.raw" />
          </v-col>
          <v-col>
            <v-divider />
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
