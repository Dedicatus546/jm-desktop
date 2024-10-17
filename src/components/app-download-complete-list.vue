<script setup lang="ts">
import { getDownloadComicListIpc } from "@/apis";
import useIpcRendererInvoke from "@/compositions/use-ipc-renderer-invoke";
import useAppStore from "@/stores/use-app-store";

const appStore = useAppStore();
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

const openLocalFile = () => {
  console.log("click");
};
</script>

<template>
  <a-spin :spinning="loading" :gutter="[16, 16]">
    <a-row :gutter="[16, 16]">
      <a-col v-if="!data || data.total === 0" :span="24">
        <a-empty>
          <template #description>
            <a-typography-text type="secondary">
              暂无下载完成的任务
            </a-typography-text>
          </template>
        </a-empty>
      </a-col>
      <template v-else>
        <a-col
          v-for="item of data?.list ?? []"
          :key="item.id"
          :sm="8"
          :xl="6"
          :xxl="4"
        >
          <a-card class="cursor-pointer" @click="openLocalFile">
            <template #cover>
              <img
                loading="lazy"
                class="block aspect-[3/4]"
                :alt="`${item.name}的封面`"
                :src="`${appStore.setting.imgHost}/media/albums/${item.id}_3x4.jpg`"
              />
            </template>
            <a-typography-title
              :level="5"
              class="break-all line-clamp-2 min-h-[48px]"
            >
              <a-tooltip :title="item.name">{{ item.name }}</a-tooltip>
            </a-typography-title>
            <a-typography-text class="break-all line-clamp-1">
              <a-tooltip v-if="item.author">
                <template #title>
                  {{ item.author }}
                </template>
                {{ item.author }}
              </a-tooltip>
              <template v-else>未知作者</template>
            </a-typography-text>
          </a-card>
        </a-col>
        <a-col :span="24">
          <a-pagination
            :current="pagination.page"
            align="right"
            :page-size="8"
            :total="pagination.total"
            :show-size-changer="false"
            @change="onPageChange"
          />
        </a-col>
      </template>
    </a-row>
  </a-spin>
</template>
