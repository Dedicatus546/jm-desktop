<script setup lang="ts">
import { getDownloadComicListIpc } from "@/apis";
import EMPTY_STATE_IMG from "@/assets/empty-state/3.jpg";
import useIpcRendererInvoke from "@/compositions/use-ipc-renderer-invoke";

const pagination = reactive({
  page: 1,
  pageSize: 8,
  total: 0,
});
const { loading, data, invoke } = useIpcRendererInvoke(() =>
  getDownloadComicListIpc({
    page: pagination.page,
    pageSize: pagination.pageSize,
  }),
);

const onPageChange = (page: number) => {
  pagination.page = page;
  invoke();
};
</script>

<template>
  <v-card>
    <v-card-text>
      <v-data-iterator
        :items="data?.list ?? []"
        :items-per-page="pagination.pageSize"
        :loading="loading"
        @update:page="onPageChange"
      >
        <template #loader>
          <div class="h-[30vh] flex items-center justify-center">
            <v-progress-circular indeterminate></v-progress-circular>
          </div>
        </template>
        <template #no-data>
          <app-empty-state
            title="一本都不下载，下一次干活又得找了"
            :image="EMPTY_STATE_IMG"
          ></app-empty-state>
        </template>
        <template #default="{ items }">
          <v-row>
            <template v-for="item of items" :key="item.raw.id">
              <v-col cols="6" :sm="4" :md="3" :lg="2">
                <comic-download-complete-item :comic="item.raw" />
              </v-col>
            </template>
          </v-row>
        </template>
      </v-data-iterator>
    </v-card-text>
  </v-card>
</template>
