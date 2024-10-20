<script setup lang="ts">
import { usePagination, useRequest } from "alova/client";

import { getWeekComicListApi, getWeekListApi } from "@/apis";

const formState = reactive({
  category: -1,
  type: "manga",
});

const {
  data,
  onSuccess,
  loading: weekLoading,
} = useRequest(() => getWeekListApi());

const {
  // page,
  // total,
  data: list,
  loading,
} = usePagination(
  (page) =>
    getWeekComicListApi({
      page,
      category: formState.category,
      type: formState.type,
    }),
  {
    // 一般只有一页
    preloadNextPage: false,
    immediate: false,
    data: (res) => res.data.list,
    total: (res) => res.data.total,
    watchingStates: [() => formState.category, () => formState.type],
  },
);

onSuccess(() => {
  if (data.value.data.categoryList.length > 0) {
    formState.category = data.value.data.categoryList[0].id;
  }
  // if (data.value.data.typeList.length > 0) {
  //   formState.type = data.value.data.typeList[0].id;
  // }
  // send(1, 80);
});
</script>

<template>
  <a-card>
    <a-row :gutter="[16, 16]">
      <a-col v-if="weekLoading" :span="24">
        <a-flex class="min-h-[200px]" align="center" justify="center">
          <a-spin />
        </a-flex>
      </a-col>
      <template v-else>
        <a-col :span="12">
          <a-select
            v-model:value="formState.category"
            size="large"
            class="w-full"
          >
            <a-select-option
              v-for="item of data?.data.categoryList ?? []"
              :key="item.id"
              :value="item.id"
            >
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-col>
        <a-col :span="12">
          <a-select v-model:value="formState.type" size="large" class="w-full">
            <a-select-option
              v-for="item of data?.data.typeList ?? []"
              :key="item.id"
              :value="item.id"
            >
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-col>
        <a-col :span="24">
          <a-spin :spinning="loading">
            <a-row :gutter="[16, 16]">
              <a-col
                v-for="item of list ?? []"
                :key="item.id"
                :sm="8"
                :xl="6"
                :xxl="4"
              >
                <comic-item :comic="item" />
              </a-col>
            </a-row>
          </a-spin>
        </a-col>
      </template>
    </a-row>
  </a-card>
</template>
