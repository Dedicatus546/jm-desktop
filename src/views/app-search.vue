<script setup lang="ts">
import { usePagination } from "alova/client";

import { getComicListApi } from "@/apis";
import EMPTY_STATE_IMG from "@/assets/empty-state/3.jpg";

const router = useRouter();
const formState = reactive({
  content: "",
  order: "mr",
});
const redirectId = ref<number | null>(null);

const { page, pageSize, pageCount, data, send, loading, onSuccess } =
  usePagination(
    (page) =>
      getComicListApi({
        page,
        content: formState.content,
        order: formState.order,
      }),
    {
      initialPage: 1,
      initialPageSize: 80,
      data: (res) => {
        const list = res.data.content;
        redirectId.value = res.data.redirect_aid;
        return list;
      },
      total: (res) => res.data.total,
      watchingStates: [() => formState.order],
    },
  );

// 如果根据 id 搜索应该直接跳到指定详情页
onSuccess(() => {
  if (redirectId.value) {
    router.push({
      name: "COMIC_DETAIL",
      params: {
        id: redirectId.value,
      },
    });
    formState.content = "";
    redirectId.value = null;
    send(1, 80);
  }
});
</script>

<template>
  <v-card>
    <v-card-text>
      <v-data-iterator
        :items="data"
        :items-per-page="pageSize"
        :loading="loading"
      >
        <template #loader>
          <div class="h-[30vh] flex items-center justify-center">
            <v-progress-circular indeterminate></v-progress-circular>
          </div>
        </template>
        <template #header>
          <div class="flex mb-2">
            <div class="w-[200px]">
              <v-select
                v-model:model-value="formState.order"
                hide-details
                :items="[
                  {
                    title: '最新',
                    value: 'mr',
                  },
                  {
                    title: '最多收藏',
                    value: 'mv',
                  },
                  {
                    title: '最多图片',
                    value: 'mp',
                  },
                  {
                    title: '最多爱心',
                    value: 'tf',
                  },
                ]"
              ></v-select>
            </div>
            <div class="flex-grow">
              <v-text-field
                v-model:model-value="formState.content"
                placeholder="车牌号，名称，作者"
                @keyup.enter="send(1, 80)"
              >
                <template #append>
                  <v-btn
                    variant="text"
                    icon="mdi-magnify"
                    @click="loading || send(1, 80)"
                  />
                </template>
              </v-text-field>
            </div>
          </div>
        </template>
        <template #no-data>
          <app-empty-state
            title="来到了知识的荒漠，你的 XP 可能比较特殊"
            :image="EMPTY_STATE_IMG"
          ></app-empty-state>
        </template>
        <template #default="{ items }">
          <v-row>
            <template v-for="item of items" :key="item.raw.id">
              <v-col cols="6" :sm="4" :md="3" :lg="2">
                <comic-route-item :comic="item.raw" />
              </v-col>
            </template>
          </v-row>
        </template>
        <template #footer>
          <div class="flex justify-end mt-4">
            <v-pagination
              v-model="page"
              :length="pageCount"
              :disabled="loading"
              :total-visible="8"
            ></v-pagination>
          </div>
        </template>
      </v-data-iterator>
    </v-card-text>
  </v-card>
</template>

<style scoped></style>
