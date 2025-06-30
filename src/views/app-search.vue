<script setup lang="ts">
import { useRouteQuery } from "@vueuse/router";
import { usePagination } from "alova/client";

import { getComicListApi } from "@/apis";
import EMPTY_STATE_IMG from "@/assets/empty-state/3.jpg";

const router = useRouter();
const content = useRouteQuery<string>("content", "", {
  mode: "push",
});
const order = useRouteQuery<string>("order", "mr", {
  mode: "push",
});

const formState = reactive({
  content: "",
  order: "mr",
});

const { page, pageSize, pageCount, data, send, loading, onSuccess } =
  usePagination(
    (page) =>
      getComicListApi({
        page,
        content: content.value,
        order: order.value,
      }),
    {
      initialPage: 1,
      initialPageSize: 80,
      data: (res) => {
        const list = res.data.content;
        if (res.data.redirect_aid) {
          (list as any).redirectId = res.data.redirect_aid;
        }
        return list;
      },
      total: (res) => res.data.total,
      watchingStates: [order, content],
      immediate: false,
    },
  );

// 如果根据 id 搜索应该直接跳到指定详情页
onSuccess(async () => {
  if ("redirectId" in data.value) {
    const redirectId = data.value.redirectId as number;
    // 这里使用 replace 数字不记录在路由历史中
    // 因为数字类会自动重定向
    router.replace({
      name: "COMIC_DETAIL",
      params: {
        id: redirectId,
      },
    });
  }
});

const submit = () => {
  content.value = formState.content;
  order.value = formState.order;
};

watch(
  [content, order],
  ([content, order]) => {
    formState.content = content;
    formState.order = order;
  },
  {
    immediate: true,
  },
);

watch(
  content,
  (content) => {
    if (content) {
      send();
    }
  },
  {
    immediate: true,
  },
);
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
          <div
            class="wind-flex wind-h-[30vh] wind-items-center wind-justify-center"
          >
            <v-progress-circular indeterminate></v-progress-circular>
          </div>
        </template>
        <template #header>
          <v-form @submit.prevent="submit">
            <v-text-field
              v-model:model-value="formState.content"
              color="primary"
              variant="outlined"
              hide-details
              placeholder="车牌号，名称，作者"
              @keyup.enter="submit"
            >
              <template #prepend>
                <v-select
                  v-model:model-value="formState.order"
                  hide-details
                  color="primary"
                  variant="outlined"
                  class="wind-w-[120px]"
                  item-title="title"
                  item-value="value"
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
              </template>
              <template #append-inner>
                <v-btn
                  color="primary"
                  :disabled="!formState.content"
                  variant="text"
                  icon="mdi-magnify"
                  @click="submit"
                ></v-btn>
              </template>
            </v-text-field>
          </v-form>
          <div class="wind-h-8"></div>
        </template>
        <template #no-data>
          <v-empty-state
            title="来到了知识的荒漠，你的 XP 可能比较特殊"
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
